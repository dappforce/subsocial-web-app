
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Section from '../utils/Section';
import { hexToNumber } from '@polkadot/util';
import { PostId, CommentId, OptionComment, Comment, BlogId, Activity } from '../types';
import { ViewPost } from '../posts/ViewPost';
import { api, withMulti } from '@polkadot/ui-api';
import ViewBlog from '../blogs/ViewBlog';
import moment from 'moment-timezone';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';
import { getNewsFeed, getNotifications, LIMIT } from '../utils/OffchainUtils';
import InfiniteScroll from 'react-infinite-scroll-component';
import AddressMiniDf from '../utils/AddressMiniDf';
import { MutedDiv } from '../utils/MutedText';
import { Loader } from 'semantic-ui-react';

type ActivityProps = {
  activity: Activity;
};

const InnerViewNewsFeed = (props: MyAccountProps) => {
  const { myAddress } = props;
  if (!myAddress) return <em>Oops...Incorect Account</em>;

  const [ items, setItems ] = useState([] as Activity[]);
  const [ offset, setOffset ] = useState(0);
  const [ hasMore, setHasMore ] = useState(true);

  const getNewsArray = async () => {
    const data = await getNewsFeed(myAddress, offset, LIMIT);
    if (data.length < LIMIT) setHasMore(false);
    setItems(items.concat(data));
    setOffset(offset + LIMIT);
  };

  useEffect(() => {
    if (!myAddress) return;

    getNewsArray().catch(err => new Error(err));

  },[false]);
  const totalCount = items && items.length;
  const NewsFeedArray = items.map((item, id) =>
    <ViewActivity key={id} activity={item}/>);
  return (
  <Section title={`News Feed (${totalCount})`}>{
    totalCount === 0
    ? <MutedDiv>Your feed is empty</MutedDiv>
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

const InnerViewNotifications = (props: MyAccountProps) => {
  const { myAddress } = props;
  if (!myAddress) return <em>Opps...Incorect Account</em>;

  const [ items, setItems ] = useState([] as Activity[]);
  const [ hasMore, setHasMore ] = useState(true);
  const [ offset, setOffset ] = useState(0);

  const getNotificationsArray = async () => {
    const data = await getNotifications(myAddress, offset, LIMIT);
    if (data.length < LIMIT) setHasMore(false);
    setItems(items.concat(data));
    setOffset(offset + LIMIT);
  };

  useEffect(() => {
    if (!myAddress) return;

    getNotificationsArray().catch(err => new Error(err));
  },[false]);

  const totalCount = items && items.length;
  const NotificationsArray = items.map((item, id) =>
    <Notification key={id} activity={item}/>);
  return (
  <Section title={`Notifications (${totalCount})`}>
    {totalCount === 0
    ? <em>News is not yet</em>
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

function ViewActivity (props: ActivityProps) {
  const { activity } = props;
  const { post_id } = activity;
  const postId = new PostId(hexToNumber('0x' + post_id));// TODO create function

  return <ViewPost id={postId} preview/>;
}

export function Notification (props: ActivityProps) {
  const { activity } = props;
  const { account, event, date, post_id, comment_id, blog_id, agg_count } = activity;
  const formatDate = moment(date).format('lll');
  const [ message, setMessage ] = useState('string');
  const [ subject, setSubject ] = useState(<></>);
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
          setMessage(Events.BlogFollowed);
          setSubject(<ViewBlog id={blogId} nameOnly/>);
          break;
        }
        case 'BlogCreated' : {
          const blogId = new BlogId(hexToNumber('0x' + blog_id));
          setMessage(Events.BlogCreated);
          setSubject(<ViewBlog id={blogId} nameOnly/>);
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
          setSubject(<Link href={`/post?id=${postId.toString()}`}><ViewPost id={postId} withCreatedBy={false} nameOnly withLink={false}/></Link>);
          break;
        }
        case 'PostShared' : {
          postId = new PostId(hexToNumber('0x' + post_id));
          setMessage(Events.PostShared);
          setSubject(<ViewPost id={postId} withCreatedBy={false} nameOnly/>);
          break;
        }
        case 'PostReactionCreated': {
          postId = new PostId(hexToNumber('0x' + post_id));
          setMessage(Events.PostReactionCreated);
          setSubject(<ViewPost id={postId} withCreatedBy={false} nameOnly/>);
          break;
        }
        case 'CommentReactionCreated': {
          const commentId = new CommentId(hexToNumber('0x' + comment_id));
          const commentOpt = await api.query.blogs.commentById(commentId) as OptionComment;
          if (commentOpt.isNone) return;

          const comment = commentOpt.unwrap() as Comment;
          postId = new PostId(hexToNumber('0x' + comment.post_id));
          setMessage(Events.CommentReactionCreated);
          setSubject(<ViewPost id={postId} withCreatedBy={false} nameOnly/>);
          break;
        }
      }
    };
    loadActivity().catch(err => new Error(err));
  }, [ postId > new PostId(0) ]);

  return <div style={{ borderBottom: '1px solid #ddd' }}>
    <AddressMiniDf
      value={account}
      isShort={true}
      isPadded={false}
      size={48}
      date={formatDate}
      event={message}
      subject={subject}
      count={agg_count}
      asActivity
    />
  </div>;
}

export const ViewNewsFeed = withMulti(
  InnerViewNewsFeed,
  withMyAccount
);

export const ViewNotifications = withMulti(
  InnerViewNotifications,
  withMyAccount
);
