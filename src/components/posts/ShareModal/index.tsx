import React, { useState } from 'react'
import { getTxParams } from '../../substrate'
import { Modal } from 'antd'
import Button from 'antd/lib/button'
import { MyAccountProps } from '../../utils/MyAccount'
import { LabeledValue } from 'antd/lib/select'
import SelectSpacePreview from '../../utils/SelectSpacePreview'
import { PostExtension, SharedPost, IpfsContent } from '@subsocial/types/substrate/classes'
import { useForm, Controller, ErrorMessage } from 'react-hook-form'
import { useSubsocialApi } from '../../utils/SubsocialApiContext'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import dynamic from 'next/dynamic'
import { buildSharePostValidationSchema } from '../PostValidation'
import { isEmptyArray } from '@subsocial/utils'
import DfMdEditor from '../../utils/DfMdEditor'
import { CreateSpaceButton } from '../../spaces/helpers'
import styles from './index.module.sass'
import { useCreateReloadPost, useCreateReloadSpace } from 'src/rtk/app/hooks'
import { idToBn, PostId, SpaceId } from 'src/types'
import { useAppSelector } from 'src/rtk/app/store'
import { useMyAddress } from 'src/components/auth/MyAccountContext'
import { selectSpaceIdsByOwner } from 'src/rtk/features/spaceIds/ownSpaceIdsSlice'
import { PublicPostPreviewById } from '../PublicPostPreview'

const TxButton = dynamic(() => import('../../utils/TxButton'), { ssr: false })

type Props = MyAccountProps & {
  postId: PostId
  spaceIds?: SpaceId[]
  open?: boolean
  onClose: () => void
}

const Fields = {
  body: 'body'
}

const InnerSharePostModal = (props: Props) => {
  const { open, onClose, postId, spaceIds } = props

  if (!spaceIds) {
    return null
  }

  const extension = new PostExtension({ SharedPost: idToBn(postId) as SharedPost })

  const { ipfs } = useSubsocialApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()
  const [ spaceId, setSpaceId ] = useState(spaceIds[0])
  const reloadPost = useCreateReloadPost()
  const reloadSpace = useCreateReloadSpace()
  const { control, errors, formState, watch } = useForm({
    validationSchema: buildSharePostValidationSchema(),
    reValidateMode: 'onBlur',
    mode: 'onBlur'
  })

  const body = watch(Fields.body, '')
  const { isSubmitting } = formState

  const onTxFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
    // TODO show a failure message
    onClose()
  }

  const onTxSuccess: TxCallback = () => {
    // TODO show a success message
    reloadPost({ id: postId })
    reloadSpace({ id: spaceId })
    onClose()
  }

  const newTxParams = (hash: IpfsCid) => {
    return [ spaceId, extension, new IpfsContent(hash) ]
  }

  const renderTxButton = () =>
    <TxButton
      type='primary'
      label={'Create a post'}
      disabled={isSubmitting}
      params={() => getTxParams({
        json: { body },
        buildTxParamsCallback: newTxParams,
        setIpfsCid,
        ipfs
      })}
      tx={'posts.createPost'}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      successMessage='Shared to your space'
      failedMessage='Failed to share'
    />

  const renderShareView = () => {
    if (isEmptyArray(spaceIds)) {
      return (
        <CreateSpaceButton>
          <a className='ui button primary'>
            Create my first space
          </a>
        </CreateSpaceButton>
      )
    }

    return <div className={styles.DfShareModalBody}>
      <span className={styles.DfShareModalSelector}>
        <SelectSpacePreview
          spaceIds={spaceIds || []}
          onSelect={saveSpace}
          imageSize={24}
          defaultValue={spaceId?.toString()}
        />
      </span>

      <form style={{ margin: '1rem 0' }}>
        <Controller
          control={control}
          as={<DfMdEditor />}
          options={{ autofocus: true }}
          name={Fields.body}
          value={body}
          className={`${errors[Fields.body] && 'error'} ${styles.DfShareModalMdEditor}`}
        />
        <div className='DfError'>
          <ErrorMessage errors={errors} name={Fields.body} />
        </div>
      </form>
      <PublicPostPreviewById postId={postId} asRegularPost />
    </div>
  }

  const saveSpace = (value: string | number | LabeledValue) => {
    setSpaceId(value as string)
  }

  return <Modal
    onCancel={onClose}
    visible={open}
    title={'Share post'}
    className={styles.DfShareModal}
    footer={
      <>
        <Button onClick={onClose}>Cancel</Button>
        {renderTxButton()}
      </>
    }
  >
    {renderShareView()}
  </Modal>
}

export const SharePostModal = (props: Props) => {
  const myAddress = useMyAddress()
  const mySpaceIds = useAppSelector(state => selectSpaceIdsByOwner(state, myAddress as string)) || []

  return <InnerSharePostModal {...props} spaceIds={mySpaceIds} />
}
