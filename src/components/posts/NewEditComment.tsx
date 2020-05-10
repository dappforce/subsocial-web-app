import React, { useState } from 'react';
import { MyAccountProps } from '../utils/MyAccount';
import { PostExtension, PostUpdate, CommentExt, OptionId } from '@subsocial/types/substrate/classes';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { IpfsHash, Post, PostId } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from '@subsocial/react-components/Status/types';
import { SubmittableResult } from '@polkadot/api';
import SimpleMDEReact from 'react-simplemde-editor';
import dynamic from 'next/dynamic';
import { buildSharePostValidationSchema } from './PostValidation'
import { PostContent } from '@subsocial/types';
import { registry } from '@subsocial/react-api';
import { Option } from '@polkadot/types/codec';
import { Button } from 'antd';
import { getNewIdFromEvent } from '../utils/utils';
import { newLogger } from '@subsocial/utils';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });
const log = newLogger('New Comment');

type Props = MyAccountProps & {
  post: Post,
  struct?: Post,
  content?: PostContent,
  callback?: (id?: PostId) => void,
};

const Fields = {
  body: 'body'
}

export const EditComment = (props: Props) => {
  const { callback, struct, content, post } = props;
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

  console.log('Body wather:', body);
  const { isSubmitting, dirty } = formState;

  const { id, extension } = post;

  const commentExt = extension.isComment
    ? new CommentExt({ parent_id: new OptionId(id as any), root_post_id: extension.asComment.root_post_id })
    : new CommentExt({ parent_id: new OptionId(), root_post_id: id })

  const newExtension = new PostExtension({ Comment: commentExt })

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
    cancelCallback()
  };

  const onTxSuccess: TxCallback = (txResult: SubmittableResult) => {
    const _id = id || getNewIdFromEvent(txResult);
    callback && callback(_id)
  };

  const newTxParams = (hash: IpfsHash): any[] => {
    if (!struct) {
      return [ newExtension, hash ];
    } else {
      // TODO update only dirty values.
      const update = new PostUpdate(
        {
        // TODO setting new blog_id will move the post to another blog.
          blog_id: new Option(registry, 'u64', null),
          ipfs_hash: new Option(registry, 'Text', hash)
        });
      return [ struct.id, update ];
    }
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
      log.error('Failed build tx params: %o', err)
      return []
    }
  };

  const renderTxButton = () => (
    <TxButton
      label={!struct
        ? `Create a post`
        : `Update a post`
      }
      isDisabled={isSubmitting || !dirty}
      params={buildTxParams as any}
      tx={struct
        ? 'social.updatePost'
        : 'social.createPost'
      }
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
      <Button type='default' onClick={cancelCallback}>Cancel</Button>
    </div>
  </div>
};
