import React, { useState } from 'react';
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
import { CommentContent } from '@subsocial/types';
import { registry } from '@subsocial/react-api';
import { Option } from '@polkadot/types/codec';
import { Button } from 'antd';
import { getNewIdFromEvent } from '../utils/utils';
import { newLogger } from '@subsocial/utils';
import BN from 'bn.js'

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });
const log = newLogger('New Comment');

type FCallback = (id?: BN) => void

type Props = MyAccountProps & {
  newTxParams: (hash: IpfsHash) => any[]
  content?: CommentContent,
  extrinsic: string,
  label: string,
  callback?: FCallback
  withCancel?: boolean
};

const Fields = {
  body: 'body'
}

export const InnerEditComment = (props: Props) => {
  const { callback, newTxParams, content, label, extrinsic, withCancel = false } = props;
  const { ipfs } = useSubsocialApi()
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();

  const { control, errors, formState, watch, reset } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  });

  const cancelCallback = () => {
    callback && callback()
    reset(Fields)
  }

  const body = watch(Fields.body, content?.body || '');

  const { isSubmitting, dirty } = formState;

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
    cancelCallback()
  };

  const onTxSuccess: TxCallback = (txResult: SubmittableResult) => {
    const id = getNewIdFromEvent(txResult);
    callback && callback(id)
  };

  const buildTxParams = async (): Promise<any[]> => {
    try {
      const hash = await ipfs.saveContent({ body })
      if (hash) {
        setIpfsHash(hash);
        return newTxParams(hash)
      } else {
        throw new Error('Invalid hash')
      }
    } catch (err) {
      log.error('Failed to build tx params: %o', err)
      return []
    }
  };

  const renderTxButton = () => (
    <TxButton
      label={label}
      isDisabled={isSubmitting || !dirty}
      params={buildTxParams}
      tx={extrinsic}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
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

  return <InnerEditComment newTxParams={newTxParams} label='Comment' extrinsic='social.createPost' callback={callback} withCancel={withCancel} />;
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
      // TODO setting new blog_id will move the post to another blog.
        blog_id: new Option(registry, 'u64', null),
        ipfs_hash: new Option(registry, 'Text', hash),
        hidden: new OptionBool(false) // TODO has no implementation on UI
      });
    return [ struct.id, update ];
  }

  return <InnerEditComment newTxParams={newTxParams} label='Edit' extrinsic='social.updatePost' callback={callback} content={content} withCancel />;
}
