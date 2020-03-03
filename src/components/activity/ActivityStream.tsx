
import React, { useState, useEffect } from 'react';
import Section from '../utils/Section';
import { hexToNumber } from '@polkadot/util';
import { PostId, CommentId, OptionComment, Comment, BlogId, Activity } from '../types';
import ViewPostPage, { PostData, loadPostData, loadExtPost } from '../posts/ViewPost';
import { ViewBlogPage, loadBlogData } from '../blogs/ViewBlog';
import moment from 'moment-timezone';
import { getNewsFeed, getNotifications } from '../utils/OffchainUtils';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Loader } from 'semantic-ui-react';
import { NoData, NotAuthorized } from '../utils/DataList';
import { INFINITY_LIST_PAGE_SIZE } from '../../config/ListData.config';
import { Loading } from '../utils/utils';
import { getApi } from '../utils/SubstrateApi';
import { HeadMeta } from '../utils/HeadMeta';
import { useMyAccount } from '../utils/MyAccountContext';
import dynamic from 'next/dynamic';
import { DfBgImg } from '../utils/DfBgImg';
import { isEmptyStr } from '../utils';
import { registry } from '@polkadot/react-api';

const AddressComponents = dynamic(() => import('../utils/AddressComponents'), { ssr: false });

type ActivityProps = {
  activity: Activity;
};

export const ViewNewsFeed = () => {
  const { state: { address: myAddress } } = useMyAccount();

  const [ items, setItems ] = useState([] as Activity[]);
  const [ offset, setOffset ] = useState(0);
  const [ hasMore, setHasMore ] = useState(true);

  useEffect(() => {
    if (!myAddress) return;

    getNewsArray(0).catch(err => new Error(err));
  }, [ myAddress ]);

  if (!myAddress) return <NotAuthorized/>;

  const getNewsArray = async (actualOffset: number = offset) => {
    const isFirstPage = actualOffset === 0;
    const data = await getNewsFeed(myAddress, actualOffset, INFINITY_LIST_PAGE_SIZE);
    console.log('Data', actualOffset, data);
    if (data.length < INFINITY_LIST_PAGE_SIZE) setHasMore(false);
    setItems(isFirstPage ? data : items.concat(data));
    setOffset(actualOffset + INFINITY_LIST_PAGE_SIZE);
  };

  const totalCount = items && items.length;
  const NewsFeedArray = items.map((item, id) =>
    <ViewActivity key={id} activity={item} />);
  return (<>
    <HeadMeta title='Feed' />
    <Section title={`News Feed (${totalCount})`}>{
      totalCount === 0
        ? <NoData description='Your feed is empty'/>
        : <InfiniteScroll
          dataLength={totalCount}
          next={getNewsArray}
          hasMore={hasMore}
            // endMessage={<MutedDiv className='DfEndMessage'>You have read all feed</MutedDiv>}
          loader={<Loader active inline='centered' />}
        >
          {NewsFeedArray}
        </InfiniteScroll>
    }</Section>
  </>
  );
};

export const ViewNotifications = () => {
  const { state: { address: myAddress } } = useMyAccount();

  const [ items, setItems ] = useState([] as Activity[]);
  const [ hasMore, setHasMore ] = useState(true);
  const [ offset, setOffset ] = useState(0);

  useEffect(() => {
    if (!myAddress) return;

    getNotificationsArray(0).catch(err => new Error(err));
  }, [ myAddress ]);

  if (!myAddress) return <NotAuthorized/>;

  const getNotificationsArray = async (actualOffset: number = offset) => {
    const isFirstPage = actualOffset === 0;
    const data = await getNotifications(myAddress, actualOffset, INFINITY_LIST_PAGE_SIZE);
    if (data.length < INFINITY_LIST_PAGE_SIZE) setHasMore(false);
    setItems(isFirstPage ? data : items.concat(data));
    setOffset(actualOffset + INFINITY_LIST_PAGE_SIZE);
  };

  const totalCount = items && items.length;
  const NotificationsArray = items.map((item, id) =>
    <Notification key={id} activity={item} />);
  return (<>
    <HeadMeta title='Notifications' />
    <Section title={`Notifications (${totalCount})`}>
      {totalCount === 0
        ? <NoData description='No notifications for you'/>
        : <InfiniteScroll
          dataLength={totalCount}
          next={getNotificationsArray}
          hasMore={hasMore}
            // endMessage={<MutedDiv className='DfEndMessage'>You have read all notifications</MutedDiv>}
          loader={<Loader active inline='centered' />}
        >
          {NotificationsArray}
        </InfiniteScroll>
      }
    </Section>
  </>
  );
};

function ViewActivity (props: ActivityProps) {
  const { activity } = props;
  const { post_id } = activity;
  const [ data, setData ] = useState([] as PostData[]);
  const postId = new PostId(registry, hexToNumber('0x' + post_id));// TODO create function

  useEffect(() => {
    const loadData = async () => {
      const api = await getApi();
      const postData = await loadPostData(api, postId);
      const postExtData = postData.post ? await loadExtPost(api, postData.post) : {} as PostData;
      setData([ postData, postExtData ]);
    };

    loadData().catch(console.log);
  }, [ false ]);

  return data.length > 0 ? <ViewPostPage postData={data[0]} postExtData={data[1]} variant='preview' withBlogName /> : <Loading/>;
}

export function Notification (props: ActivityProps) {
  const { activity } = props;
  const { account, event, date, post_id, comment_id, blog_id, agg_count } = activity;
  const formatDate = moment(date).format('lll');
  const [ message, setMessage ] = useState('string');
  const [ subject, setSubject ] = useState<React.ReactNode>(<></>);
  const [ image, setImage ] = useState('');
  const [ loading, setLoading ] = useState(true);
  let postId = new PostId(registry, 0);

  enum Events {
    AccountFollowed = 'followed your account',
    PostShared = 'shared yout post',
    BlogFollowed = 'followed your blog',
    BlogCreated = 'created blog',
    CommentCreated = 'commented on your post',
    CommentReply = 'replied to your comment',
    PostReactionCreated = 'reacted to your post',
    CommentReactionCreated = 'reacted to your comment'
  }

  useEffect(() => {
    const loadActivity = async () => {
      const api = await getApi();
      switch (event) {
        case 'AccountFollowed': {
          setMessage(Events.AccountFollowed);
          break;
        }
        case 'BlogFollowed': {
          const blogId = new BlogId(registry, hexToNumber('0x' + blog_id));
          const blogData = await loadBlogData(api, blogId);
          setMessage(Events.BlogFollowed);
          setSubject(<ViewBlogPage blogData={blogData} nameOnly withLink />);
          break;
        }
        case 'BlogCreated': {
          const blogId = new BlogId(registry, hexToNumber('0x' + blog_id));
          const blogData = await loadBlogData(api, blogId);
          setMessage(Events.BlogCreated);
          setSubject(<ViewBlogPage blogData={blogData} nameOnly withLink />);
          break;
        }
        case 'CommentCreated': {
          if (postId === new PostId(registry, 0)) {
            postId = new PostId(registry, hexToNumber('0x' + post_id));
          } else {
            const commentId = new CommentId(registry, hexToNumber('0x' + comment_id));
            const commentOpt = await api.query.blogs.commentById(commentId) as OptionComment;
            if (commentOpt.isNone) return;

            const comment = commentOpt.unwrap() as Comment;
            postId = new PostId(registry, hexToNumber('0x' + comment.post_id));
            if (comment.parent_id.isSome) {
              setMessage(Events.CommentReactionCreated);
            } else {
              setMessage(Events.CommentCreated);
            }
          }
          const postData = await loadPostData(api, postId);
          setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          const { initialContent } = postData;
          setImage(initialContent ? initialContent.image : '');
          break;
        }
        case 'PostShared': {
          postId = new PostId(registry, hexToNumber('0x' + post_id));
          const postData = await loadPostData(api, postId);
          setMessage(Events.PostShared);
          setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          const { initialContent } = postData;
          setImage(initialContent ? initialContent.image : '');
          break;
        }
        case 'PostReactionCreated': {
          postId = new PostId(registry, hexToNumber('0x' + post_id));
          const postData = await loadPostData(api, postId);
          setMessage(Events.PostReactionCreated);
          setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          const { initialContent } = postData;
          setImage(initialContent ? initialContent.image : '');
          break;
        }
        case 'CommentReactionCreated': {
          const commentId = new CommentId(registry, hexToNumber('0x' + comment_id));
          const commentOpt = await api.query.blogs.commentById(commentId) as OptionComment;
          if (commentOpt.isNone) return;

          const comment = commentOpt.unwrap() as Comment;
          postId = new PostId(registry, hexToNumber('0x' + comment.post_id));
          const postData = await loadPostData(api, postId);
          setMessage(Events.CommentReactionCreated);
          setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          const { initialContent } = postData;
          setImage(initialContent ? initialContent.image : '');
          break;
        }
      }
      setLoading(false);
    };
    loadActivity().catch(err => new Error(err));
  }, [ postId > new PostId(registry, 0), message ]);

  return loading
    ? <Loading/>
    : <div className='DfNotificationItem'>
      <AddressComponents
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
      {isEmptyStr(image) && <DfBgImg width={80} height={60} src={image}/>}
    </div>;
}
