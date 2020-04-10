import React, { useEffect, useState } from 'react';
import { hexToBn } from '@polkadot/util';
import { Comment } from '@subsocial/types/substrate/interfaces/subsocial';
import { Option } from '@polkadot/types';
import ViewPostPage, { loadPostData } from '../posts/ViewPost';
import { loadBlogData, ViewBlogPage } from '../blogs/ViewBlog';
import moment from 'moment-timezone';
import { Loading } from '../utils/utils';
import { getApi } from '../utils/SubstrateApi';
import dynamic from 'next/dynamic';
import { DfBgImg } from '../utils/DfBgImg';
import { isEmptyStr } from '../utils';
import BN from 'bn.js';
import { Activity } from '@subsocial/types/offchain';

const AddressComponents = dynamic(() => import('../utils/AddressComponents'), { ssr: false });

type Props = {
  activity: Activity
}

export function Notification (props: Props) {
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
      const api = await getApi();
      switch (event) {
        case 'AccountFollowed': {
          setMessage(Events.AccountFollowed);
          break;
        }
        case 'BlogFollowed': {
          const blogId = hexToBn(blog_id);
          const blogData = await loadBlogData(api, blogId);
          setMessage(Events.BlogFollowed);
          setSubject(<ViewBlogPage blogData={blogData} nameOnly withLink />);
          break;
        }
        case 'BlogCreated': {
          const blogId = hexToBn(blog_id);
          const blogData = await loadBlogData(api, blogId);
          setMessage(Events.BlogCreated);
          setSubject(<ViewBlogPage blogData={blogData} nameOnly withLink />);
          break;
        }
        case 'CommentCreated': {
          if (postId === new BN(0)) {
            postId = hexToBn(post_id);
          } else {
            const commentId = hexToBn(comment_id);
            const commentOpt = await api.query.social.commentById(commentId) as Option<Comment>;
            if (commentOpt.isNone) return;

            const comment = commentOpt.unwrap() as Comment;
            postId = comment.post_id;
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
          postId = hexToBn(post_id);
          const postData = await loadPostData(api, postId);
          setMessage(Events.PostShared);
          setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          const { initialContent } = postData;
          setImage(initialContent ? initialContent.image : '');
          break;
        }
        case 'PostReactionCreated': {
          postId = hexToBn(post_id);
          const postData = await loadPostData(api, postId);
          setMessage(Events.PostReactionCreated);
          setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          const { initialContent } = postData;
          setImage(initialContent ? initialContent.image : '');
          break;
        }
        case 'CommentReactionCreated': {
          const commentId = hexToBn(comment_id);
          const commentOpt = await api.query.social.commentById(commentId) as Option<Comment>;
          if (commentOpt.isNone) return;

          const comment = commentOpt.unwrap() as Comment;
          postId = comment.post_id;
          const postData = await loadPostData(api, postId);
          setMessage(Events.CommentReactionCreated);
          setSubject(<ViewPostPage postData={postData} withCreatedBy={false} variant='name only' />);
          const { initialContent } = postData;
          setImage(initialContent ? initialContent.image : '');
          break;
        }
      }
      setLoading(false);
    }

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
      {isEmptyStr(image) &&
        <DfBgImg width={80} height={60} src={image}/>
      }
    </div>
}

export default Notification
