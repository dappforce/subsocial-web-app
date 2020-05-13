import React, { useState } from 'react';
import { withCalls, withMulti } from '@subsocial/react-api';
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
import { TxFailedCallback, TxCallback } from '@subsocial/react-components/Status/types';
import { SubmittableResult } from '@polkadot/api';
import dynamic from 'next/dynamic';
import { buildSharePostValidationSchema } from './PostValidation';
import { isEmptyArray, newLogger } from '@subsocial/utils';
import DfMdEditor from '../utils/DfMdEditor';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const log = newLogger('ShareModal')

type Props = MyAccountProps & {
  postId: BN,
  open: boolean,
  close: () => void,
  blogIds?: BN[]
};

const Fields = {
  body: 'body'
}

const InnerShareModal = (props: Props) => {
  const { open, close, postId, blogIds } = props;

  if (!blogIds) return <Loading />;

  const extension = new PostExtension({ SharedPost: postId as SharedPost });

  const { ipfs } = useSubsocialApi()
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();
  const [ blogId, setBlogId ] = useState(blogIds[0]);

  const { control, errors, formState, watch } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  });

  const body = watch(Fields.body, '');
  const { isSubmitting } = formState;

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
    close()
  };

  const onTxSuccess: TxCallback = (_txResult: SubmittableResult) => {
    close()
  };

  const newTxParams = (hash: IpfsHash) => {
    return [ blogId, extension, hash ];
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
      label={`Create a post`}
      isDisabled={isSubmitting}
      params={buildTxParams}
      tx={'social.createPost'}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
    />
  );

  const renderShareView = () => {
    if (isEmptyArray(blogIds)) {
      return (
        <Link href='/blogs/new'>
          <a className='ui button primary'>
            Create your first blog
          </a>
        </Link>
      )
    }

    return <div className='DfShareModalBody'>
      <form>
        <Controller
          as={<DfMdEditor />}
          name={Fields.body}
          control={control}
          value={body}
          className={`DfMdEditor ${errors[Fields.body] && 'error'}`}
        />
        <div className='DfError'>
          <ErrorMessage errors={errors} name={Fields.body} />
        </div>
      </form>
      <ViewPost id={postId} withStats={false} withActions={false} variant='preview' />
    </div>
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
      <Modal.Header>
        <span className='mr-3'>Share a post to your blog:</span>
        <SelectBlogPreview
          blogIds={blogIds}
          onSelect={saveBlog}
          imageSize={24}
          defaultValue={blogIds[0].toString()}
        />
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
