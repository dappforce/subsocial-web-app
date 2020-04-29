import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/react-api';
import { socialQueryToProp } from '../utils/index';
import { Modal, Button } from 'semantic-ui-react';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';
import { ViewPost } from './ViewPost';
import Link from 'next/link';
import { Loading } from '../utils/utils';
import { LabeledValue } from 'antd/lib/select';
import SelectBlogPreview from '../utils/SelectBlogPreview';
import BN from 'bn.js';
import { PostExtension, SharedPost } from '@subsocial/types/substrate/classes';
import { useForm, Controller, ErrorMessage } from 'react-hook-form';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
import { TxFailedCallback, TxCallback } from '@polkadot/react-components/Status/types';
import { SubmittableResult } from '@polkadot/api';
import SimpleMDEReact from 'react-simplemde-editor';
// import { useApi } from '@polkadot/react-hooks';
import dynamic from 'next/dynamic';
import { buildSharePostValidationSchema } from './PostValidation';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });
type Props = MyAccountProps & {
  postId: BN,
  open: boolean,
  close: () => void,
  blogIds?: BN[]
};

const InnerShareModal = (props: Props) => {
  const { open, close, postId, blogIds } = props;

  const extension = new PostExtension({ SharedPost: postId as SharedPost });

  if (!blogIds) return <Loading />;

  const { ipfs } = useSubsocialApi()
  // const { isApiReady, isApiConnected } = useApi()
  const [ ipfsHash, setIpfsCid ] = useState<IpfsHash>();
  const [ blogId, setBlogId ] = useState(blogIds[0]);

  const { control, errors, formState, watch } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  });

  const body = watch('body', '');
  const { isSubmitting } = formState;

  const onSubmit = (sendTx: () => void) => {
    console.log(body)
    console.log(errors)
    ipfs.saveContent({ body: body }).then(hash => {
      if (hash) {
        setIpfsCid(hash);
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
    return [ blogId, ipfsHash, extension ];
  };

  const renderTxButton = () => (
    <TxButton
      type='submit'
      size='medium'
      label={`Create a post`}
      isDisabled={isSubmitting}
      params={buildTxParams()}
      tx={'social.createPost'}
      onClick={onSubmit}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
    />
  );

  const renderShareView = () => {
    if (blogIds.length === 0) {
      return (
        <Link href='/blogs/new'><a className='ui button primary'>Create your first blog</a></Link>
      );
    }

    return (<div className='DfShareModalBody'>
      <form>
        <Controller
          as={<SimpleMDEReact />}
          name='body'
          rules={{ maxLength: 10 }}
          control={control}
          value={body}
          className={`DfMdEditor ${errors['body'] && 'error'}`}
        />
        <div className='DfError'><ErrorMessage errors={errors} name='body' /></div>
      </form>
      <ViewPost id={postId} withStats={false} withActions={false} variant='preview'/>
    </div>
    );
  };

  const saveBlog = (value: string | number | LabeledValue) => {
    setBlogId(new BN(value as string));
  };

  return (
    <Modal
      onClose={close}
      open={open}
      size='small'
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header style={{ justifyContent: 'space-between' }}>
        <span>Share post to your blog</span>
        <SelectBlogPreview
          blogIds={blogIds}
          onSelect={saveBlog}
          imageSize={24}
          defaultValue={blogIds[0].toString()} />
      </Modal.Header>
      <Modal.Content scrolling className='DfShareModalPadding'>
        {renderShareView()}
      </Modal.Content>
      <Modal.Actions>
        <Button size='medium' onClick={close}>Cancel</Button>
        {renderTxButton()}
      </Modal.Actions>
    </Modal>
  );
};

export const ShareModal = withMulti(
  InnerShareModal,
  withMyAccount,
  withCalls<Props>(
    socialQueryToProp(`blogIdsByOwner`, { paramName: 'address', propName: 'blogIds' })
  )
);
