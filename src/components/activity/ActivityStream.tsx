
import React, { useState, useEffect } from 'react';
import Section from '../utils/Section';
import { hexToNumber } from '@polkadot/util';
import { PostId, CommentId, OptionComment, Comment, BlogId, Activity } from '../types';
import { ViewPostPage, loadPostDataList, loadPostData, PostDataListItem } from '../posts/ViewPost';
import { api } from '@polkadot/ui-api';
import { ViewBlogPage, loadBlogData } from '../blogs/ViewBlog';
import moment from 'moment-timezone';
import { getNewsFeed, getNotifications } from '../utils/OffchainUtils';
import InfiniteScroll from 'react-infinite-scroll-component';
import AddressMiniDf from '../utils/AddressMiniDf';
import { Loader } from 'semantic-ui-react';
import { NoData } from '../utils/DataList';
import { SIZE_PAGE_INFINITY_LIST } from '../../config/ListData.config';
import { useMyAccount } from '../utils/MyAccountContext';
import { NextPage } from 'next';

type ActivityProps = {
  activity: Activity;
};

type FeedProps = {
  initialData: PostDataListItem[]
  offset: number;
};

type NotificationsProps = {
  initialData: Activity[]
  offset: number;
};

export const ViewNewsFeed: NextPage<FeedProps> = (props: FeedProps) => {
  const { state: { address: myAddress } } = useMyAccount();
  if (!myAddress) return <em>Oops...Incorect Account</em>;
  const { initialData = [] as PostDataListItem[], offset: initialOffset = 0 } = props;
  const [items, setItems] = useState(initialData);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(true);

  const getNewsArray = async () => {
    const data = await loadPostsForFeed(myAddress, offset);
    console.log('Data', data);
    if (data.length < SIZE_PAGE_INFINITY_LIST) setHasMore(false);
    setItems(items.concat(data));
    setOffset(offset + SIZE_PAGE_INFINITY_LIST);
  };

  useEffect(() => {
    if (!myAddress) return;

    getNewsArray().catch(err => new Error(err));

  }, [false]);

  const totalCount = items && items.length;

  const NewsFeedArray = items.map((item, id) =>
  <ViewPostPage key={id} postData={item.postData} postExtData={item.postExtData} variant='preview' withBlogName />);

  return (
    <Section title={`News Feed (${totalCount})`}>{
      totalCount === 0
        ? <NoData description='Your feed is empty'/>
        :
        <InfiniteScroll
          dataLength={totalCount}
          next={getNewsArray}
          hasMore={hasMore}
          // endMessage={<MutedDiv className='DfEndMessage'>You have read all feed</MutedDiv>}
          loader={<Loader active inline='centered' />}
        >
          {NewsFeedArray}
        </InfiniteScroll>
    }</Section>
  );
};

const loadPostsForFeed = async (address?: string, offset: number = 0) => {
  const activities = address ? await getNewsFeed(address, offset, SIZE_PAGE_INFINITY_LIST) : [] as Activity[];
  const ids = activities.map(x => new PostId(hexToNumber('0x' + x.post_id)));
  const initialData = await loadPostDataList(api, ids);
  return initialData;
};

export const ViewNotifications: NextPage<NotificationsProps> = (props: NotificationsProps) => {
  const { initialData = [] as Activity[], offset: initialOffset = 0 } = props;
  const { state: { address: myAddress } } = useMyAccount();
  if (!myAddress) return <NoData description='Opps...Incorect Account' />;

  const [items, setItems] = useState(initialData);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialOffset);

  const getNotificationsArray = async () => {
    const data = await getNotifications(myAddress, offset, SIZE_PAGE_INFINITY_LIST);
    if (data.length < SIZE_PAGE_INFINITY_LIST) setHasMore(false);
    setItems(items.concat(data));
    setOffset(offset + SIZE_PAGE_INFINITY_LIST);
  };

  useEffect(() => {
    if (!myAddress) return;

    getNotificationsArray().catch(err => new Error(err));
  }, [false]);

  const totalCount = items && items.length;
  const NotificationsArray = items.map((item, id) =>
    <Notification key={id} activity={item} />);
  return (
    <Section title={`Notifications (${totalCount})`}>
      {totalCount === 0
        ? <NoData description='No notifications for you'/>
        :
        <InfiniteScroll
          dataLength={totalCount}
          next={getNotificationsArray}
          hasMore={hasMore}
          // endMessage={<MutedDiv className='DfEndMessage'>You have read all notifications</MutedDiv>}
          loader={<Loader active inline='centered' />}
        >
          {NotificationsArray}
        </InfiniteScroll>
      }</Section>
  );
};

export function Notification (props: ActivityProps) {
  const { activity } = props;
  const { account, event, date, post_id, comment_id, blog_id, agg_count } = activity;
  const formatDate = moment(date).format('lll');
  const [message, setMessage] = useState('string');
  const [subject, setSubject] = useState(<></>);
  let postId = new PostId(0);

  enum Events {
    AccountFollowed = 'followed your account',
    PostShared = 'shared yout post',
    BlogFollowed = 'followed your blog',
    BlogCreated = 'created blog',
    CommentCreated = 'commented your post',
    CommentReply = 'replied to your comment',
    PostReactionCreated = 'reacted to your post',
    CommentReactionCreated = 'reacted to your comment'
  }

  useEffect(() => {
    const loadActivity = async () => {
      switch (event) {
        case 'AccountFollowed': {
          setMessage(Events.AccountFollowed);
          break;
        }
        case 'BlogFollowed': {
          const blogId = new BlogId(hexToNumber('0x' + blog_id));
          const blogData = await loadBlogData(api, blogId);
          setMessage(Events.BlogFollowed);
          setSubject(<ViewBlogPage blogData={blogData} nameOnly withLink />);
          break;
        }
        case 'BlogCreated': {
          const blogId = new BlogId(hexToNumber('0x' + blog_id));
          setMessage(Events.BlogCreated);
          const blogData = await loadBlogData(api, blogId);
          setSubject(<ViewBlogPage blogData={blogData} nameOnly withLink />);
          break;
        }
        case 'CommentCreated': {
          if (postId === new PostId(0)) {
            postId = new PostId(hexToNumber('0x' + post_id));
          } else {
            const commentId = new CommentId(hexToNumber('0x' + comment_id));
            const commentOpt = await api.query.blogs.commentById(commentId) as OptionComment;
            if (commentOpt.isNone) return;

            const comment = commentOpt.unwrap() as Comment;
            postId = new PostId(hexToNumber('0x' + comment.post_id));
            if (comment.parent_id.isSome) {
              setMessage(Events.CommentReactionCreated);
            } else {
              setMessage(Events.CommentCreated);
            }
          }
          const postData = (await loadPostDataList(api, [ postId ])).pop();
          postData && setSubject(<ViewPostPage postData={postData.postData} postExtData={postData.postExtData} withCreatedBy={false} variant='name only' />);
          break;
        }
        case 'PostShared': {
          postId = new PostId(hexToNumber('0x' + post_id));
          setMessage(Events.PostShared);
          const postData = await loadPostData(api, postId);
          setSubject(<ViewPostPage postData={postData} postExtData={{}} withCreatedBy={false} variant='name only' />);
          break;
        }
        case 'PostReactionCreated': {
          postId = new PostId(hexToNumber('0x' + post_id));
          setMessage(Events.PostReactionCreated);
          const postData = await loadPostData(api, postId);
          setSubject(<ViewPostPage postData={postData} postExtData={{}} withCreatedBy={false} variant='name only' />);
          break;
        }
        case 'CommentReactionCreated': {
          const commentId = new CommentId(hexToNumber('0x' + comment_id));
          const commentOpt = await api.query.blogs.commentById(commentId) as OptionComment;
          if (commentOpt.isNone) return;

          const comment = commentOpt.unwrap() as Comment;
          postId = new PostId(hexToNumber('0x' + comment.post_id));
          setMessage(Events.CommentReactionCreated);
          const postData = await loadPostData(api, postId);
          setSubject(<ViewPostPage postData={postData} postExtData={{}} withCreatedBy={false} variant='name only' />);
          break;
        }
      }
    };
    loadActivity().catch(err => new Error(err));
  }, [postId > new PostId(0), message ]);

  return <div style={{ borderBottom: '1px solid #ddd', padding: '.5rem' }}>
    <AddressMiniDf
      value={account}
      isShort={true}
      isPadded={false}
      size={36}
      date={formatDate}
      event={message}
      subject={subject}
      count={agg_count}
      asActivity
    />
  </div>;
}
