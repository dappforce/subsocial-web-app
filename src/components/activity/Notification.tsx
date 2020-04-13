import React, { useEffect, useState } from 'react';
import { hexToBn } from '@polkadot/util';
import ViewPostPage from '../posts/ViewPost';
import { ViewBlogPage } from '../blogs/ViewBlog';
import moment from 'moment-timezone';
import { Loading } from '../utils/utils';
import dynamic from 'next/dynamic';
import { DfBgImg } from '../utils/DfBgImg';
import BN from 'bn.js';
import { Activity } from '@subsocial/types/offchain';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { isEmptyStr } from '@subsocial/utils';

const AddressComponents = dynamic(() => import('../utils/AddressComponents'), { ssr: false });

type Props = {
  activity: Activity
}

export function Notification (props: Props) {
  const { subsocial, substrate } = useSubsocialApi()
  const { activity } = props;
  const { account, event, date, post_id, comment_id, blog_id, agg_count } = activity;
  const formatDate = moment(date).format('lll');
  const [ message, setMessage ] = useState('string');
  const [ subject, setSubject ] = useState<React.ReactNode>(<></>);
  const [ image, setImage ] = useState('');
  const [ loading, setLoading ] = useState(true);
  let postId = new BN(0);

  enum Events {
    AccountFollowed = 'followed your account',
    PostShared = 'shared your post',
    BlogFollowed = 'followed your blog',
    BlogCreated = 'created a new blog',
    CommentCreated = 'commented on your post',
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
          const blogId = hexToBn(blog_id);
          const blogData = await subsocial.findBlog(blogId)
          setMessage(Events.BlogFollowed);
          blogData && setSubject(<ViewBlogPage blogData={blogData} nameOnly withLink />);
          break;
        }
        case 'BlogCreated': {
          const blogId = hexToBn(blog_id);
          const blogData = await subsocial.findBlog(blogId);
          setMessage(Events.BlogCreated);
          blogData && setSubject(<ViewBlogPage blogData={blogData} nameOnly withLink />);
          break;
        }
        case 'CommentCreated': {
          if (postId === new BN(0)) {
            postId = hexToBn(post_id);
          } else {
            const commentId = hexToBn(comment_id);

            const comment = await substrate.findComment(commentId);
            if (comment) {
              postId = comment.post_id;
              if (comment.parent_id.isSome) {
                setMessage(Events.CommentReactionCreated);
              } else {
                setMessage(Events.CommentCreated);
              }
            }
          }
          const postData = await subsocial.findPost(postId);
          postData && setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          postData && postData.content && setImage(postData.content.image || '');
          break;
        }
        case 'PostShared': {
          postId = hexToBn(post_id);
          const postData = await subsocial.findPost(postId);
          setMessage(Events.PostShared);
          postData && setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          postData && postData.content && setImage(postData.content.image || '');
          break;
        }
        case 'PostReactionCreated': {
          postId = hexToBn(post_id);
          const postData = await subsocial.findPost(postId);
          setMessage(Events.PostReactionCreated);
          postData && setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          postData && postData.content && setImage(postData.content.image || '');
          break;
        }
        case 'CommentReactionCreated': {
          const commentId = hexToBn(comment_id);
          const comment = await substrate.findComment(commentId);
          if (comment) {
            postId = comment.post_id;
          }
          const postData = await subsocial.findPost(postId);
          setMessage(Events.CommentReactionCreated);
          postData && setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          postData && postData.content && setImage(postData.content.image || '');
          break;
        }
      }
      setLoading(false);
    };
    loadActivity().catch(err => new Error(err));
  }, [ postId > new BN(0), message ]);

  return loading
    ? <Loading />
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

export default Notification
