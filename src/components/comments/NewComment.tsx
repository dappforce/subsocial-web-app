import React, { useState, useCallback } from 'react';
import { MyAccountProps } from '../utils/MyAccount';
import { PostExtension, PostUpdate, CommentExt, OptionId, OptionBool } from '@subsocial/types/substrate/classes';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { IpfsHash, Post } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from '@subsocial/react-components/Status/types';
import { SubmittableResult } from '@polkadot/api';
import SimpleMDEReact from 'react-simplemde-editor';
import dynamic from 'next/dynamic';
import { buildSharePostValidationSchema } from '../posts/PostValidation'
import { CommentContent, PostWithSomeDetails } from '@subsocial/types';
import { registry } from '@subsocial/react-api';
import { Option } from '@polkadot/types/codec';
import { Button } from 'antd';
import { getNewIdFromEvent, getTxParams } from '../utils/substrate';
import BN from 'bn.js'
import { useDispatch } from 'react-redux';
import { fakeClientId } from '../utils';
import { useMyAddress } from '../auth/MyAccountContext';
import { useSetReplyToStore, useRemoveReplyFromStore, useChangeReplyToStore } from './utils';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

type FCallback = (id?: BN) => void

type FSetCommentToStore = (fakeId: string, account: string, content: CommentContent) => void

type Props = MyAccountProps & {
  newTxParams: (hash: IpfsHash) => any[]
  content?: CommentContent,
  parentId?: string,
  extrinsic: string,
  label: string,
  callback?: FCallback
  withCancel?: boolean,
  useSetCommentToStore?: FSetCommentToStore
};

const Fields = {
  body: 'body'
}

type MockComment = {
  fakeId: string,
  account: string,
  content: CommentContent
}

const buildMockComment = ({ fakeId, account, content }: MockComment) => {
  return {
    post: {
      struct: {
        id: fakeId,
        created: {
          account: account,
          time: new Date().getTime()
        },
        score: 0,
        shares_count: 0,
        direct_replies_count: 0,
        space_id: null,
        extension: null

      },
      content: content
    }
  } as any as PostWithSomeDetails
}

export const InnerEditComment = (props: Props) => {
  const { callback, newTxParams, content, label, extrinsic, parentId, withCancel = false } = props;
  const { ipfs, subsocial } = useSubsocialApi()
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();
  const account = useMyAddress()
  const dispatch = useDispatch();
  const [ fakeId ] = useState(fakeClientId())

  const { control, errors, formState, watch, reset } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  });

  const cancelCallback = () => {
    callback && callback()
    parentId && useRemoveReplyFromStore(dispatch, { replyId: fakeId, parentId })
    reset(Fields)
  }

  const body = watch(Fields.body, content?.body || '');

  const onTxClick = useCallback(
    (body) => {
      account && parentId && useSetReplyToStore(dispatch,
        {
          reply: { replyId: fakeId, parentId },
          comment: buildMockComment({ fakeId, account, content: { body } })
        })
    },
    [ account ]
  )

  const { isSubmitting, dirty } = formState;

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
    cancelCallback()
  };

  const onTxSuccess: TxCallback = (txResult: SubmittableResult) => {
    const id = getNewIdFromEvent(txResult);
    console.log(id)
    id && subsocial.findPostWithSomeDetails(id).then(comment => {
      comment && parentId && useChangeReplyToStore(
        dispatch,
        { replyId: fakeId, parentId },
        { reply: { replyId: id.toString(), parentId },
          comment
        }
      )
    })

    callback && callback()
  };

  const renderTxButton = () => (
    <TxButton
      label={label}
      isDisabled={isSubmitting || !dirty}
      params={() => getTxParams({
        json: { body },
        buildTxParamsCallback: newTxParams,
        setIpfsHash,
        ipfs
      })}
      tx={extrinsic}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      onClick={() => onTxClick(body)}
    />
  );

  return <div className='DfShareModalBody'>
    <form>
      <Controller
        as={<SimpleMDEReact />}
        name={Fields.body}
        control={control}
        value={body}
        defaultValue={body}
        className={`DfMdEditor ${errors[Fields.body] && 'error'}`}
      />
      <div className='DfError'>
        <ErrorMessage errors={errors} name={Fields.body} />
      </div>
    </form>
    <div className='DfActionButtonsBlock'>
      {renderTxButton()}
      {withCancel && <Button type='link' onClick={cancelCallback} className="DfGreyLink">Cancel</Button>}
    </div>
  </div>
};

type NewCommentProps = {
  post: Post,
  callback?: FCallback,
  withCancel?: boolean
}

export const NewComment: React.FunctionComponent<NewCommentProps> = ({ post, callback, withCancel }) => {
  const { id, extension } = post;

  const comment = (extension.isComment && extension.asComment) || (extension as any).Comment

  const commentExt = comment
    ? new CommentExt({ parent_id: new OptionId(id), root_post_id: comment.root_post_id })
    : new CommentExt({ parent_id: new OptionId(), root_post_id: id })

  const newExtension = new PostExtension({ Comment: commentExt })

  const newTxParams = (hash: IpfsHash) => [ new OptionId(), newExtension, hash ];

  return <InnerEditComment
    newTxParams={newTxParams}
    parentId={id.toString()}
    label='Comment' extrinsic='posts.createPost'
    callback={callback}
    withCancel={withCancel} />;
}

type EditCommentProps = {
  struct: Post,
  content: CommentContent,
  callback?: FCallback
}

export const EditComment: React.FunctionComponent<EditCommentProps> = ({ struct, content, callback }) => {

  const newTxParams = (hash: IpfsHash) => {
    const update = new PostUpdate(
      {
      // TODO setting new space_id will move the post to another space.
        space_id: new Option(registry, 'u64', null),
        ipfs_hash: new Option(registry, 'Text', hash),
        hidden: new OptionBool(false) // TODO has no implementation on UI
      });
    return [ struct.id, update ];
  }

  return <InnerEditComment newTxParams={newTxParams} label='Edit' extrinsic='posts.updatePost' callback={callback} content={content} withCancel />;
}
