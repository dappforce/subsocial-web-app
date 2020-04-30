import React, { useState } from 'react';
import { MyAccountProps } from '../utils/MyAccount';
import { PostExtension, SharedPost, PostUpdate } from '@subsocial/types/substrate/classes';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { IpfsHash, Post } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from '@polkadot/react-components/Status/types';
import { SubmittableResult } from '@polkadot/api';
import SimpleMDEReact from 'react-simplemde-editor';
import dynamic from 'next/dynamic';
import { buildSharePostValidationSchema } from './PostValidation'
import { PostContent } from '@subsocial/types';
import { registry } from '@polkadot/react-api';
import { Option } from '@polkadot/types/codec';
import BN from 'bn.js'
import { Button } from 'antd';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

type Props = MyAccountProps & {
  parentId: BN,
  struct?: Post,
  content?: PostContent,
  close: () => void,
};

const Fields = {
  body: 'body'
}

export const EditComment = (props: Props) => {
  const { close, struct, content, parentId } = props;

  const { ipfs } = useSubsocialApi()
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();

  const { control, errors, formState, watch } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  });

  console.log(content?.body)

  const body = watch(Fields.body, content?.body || '');

  console.log('Body wather:', body);
  const { isSubmitting, dirty } = formState;

  const extension = new PostExtension({ SharedPost: struct?.id || parentId as SharedPost });

  const onSubmit = (sendTx: () => void) => {
    ipfs.saveContent({ body }).then(hash => {
      if (hash) {
        setIpfsHash(hash);
        sendTx();
      }
    }).catch(err => new Error(err));
  };

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    close()
  };

  const onTxSuccess: TxCallback = (_txResult: SubmittableResult) => {
    close()
  };

  const buildTxParams = () => {
    if (!struct) {
      return [ ipfsHash, extension ];
    } else {
      // TODO update only dirty values.
      const update = new PostUpdate(
        {
        // TODO setting new blog_id will move the post to another blog.
          blog_id: new Option(registry, 'u64', null),
          ipfs_hash: new Option(registry, 'Text', ipfsHash)
        });
      return [ struct.id, update ];
    }
  };

  const renderTxButton = () => (
    <TxButton
      type='submit'
      label={!struct
        ? `Create a post`
        : `Update a post`
      }
      isDisabled={isSubmitting || !dirty}
      params={buildTxParams()}
      tx={struct
        ? 'social.updatePost'
        : 'social.createPost'
      }
      onClick={onSubmit}
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
      <div className='DfActionButtonsBlock'>
        {renderTxButton()}
        <Button type='default' onClick={close}>Cancel</Button>
      </div>
    </form>
  </div>
};
