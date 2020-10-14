import React, { useState } from 'react'
import { withCalls, withMulti, spacesQueryToProp } from 'src/components/substrate'
import { Modal } from 'antd'
import Button from 'antd/lib/button'
import { withMyAccount, MyAccountProps } from 'src/components/utils/MyAccount'
import { LabeledValue } from 'antd/lib/select'
import SelectSpacePreview from 'src/components/utils/SelectSpacePreview'
import BN from 'bn.js'
import { OptionId } from '@subsocial/types/substrate/classes'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import dynamic from 'next/dynamic'
import { isEmptyArray, nonEmptyArr } from '@subsocial/utils';
import { DynamicPostPreview } from 'src/components/posts/view-post/DynamicPostPreview'
import { CreateSpaceButton } from 'src/components/spaces/helpers'
import { useRouter } from 'next/router'
import { postUrl } from 'src/components/urls/subsocial'
import { Post, PostId, Space, SpaceId } from '@subsocial/types/substrate/interfaces'
import modalStyles from 'src/components/posts/modals/index.module.sass';
import NoData from 'src/components/utils/EmptyList'

const TxButton = dynamic(() => import('src/components/utils/TxButton'), { ssr: false })

type Props = MyAccountProps & {
  post: Post
  spaceIds?: BN[]
  open: boolean
  onClose: () => void
}

const InnerMoveModal = (props: Props) => {
  const { open, onClose, post, post: { id: postId } } = props
  let { spaceIds } = props

  if (post.space_id.isSome && spaceIds) {
    const postSpaceId = post.space_id.unwrap()
    spaceIds = spaceIds.filter(spaceId => !spaceId.eq(postSpaceId))
  }

  if (!spaceIds) {
    return null
  }

  const router = useRouter()

  const [ spaceId, setSpaceId ] = useState(spaceIds[0])

  const onTxFailed: TxFailedCallback = () => {
    // TODO show a failure message
    onClose()
  }

  const onTxSuccess: TxCallback = () => {
    // TODO show a success message
    router.push(
      '/[spaceId]/posts/[postId]',
      postUrl(
        { id: spaceId as SpaceId } as Space,
        { id: postId as PostId })
      )
    onClose()
  }

  const newTxParams = () => {
    const spaceIdOption = new OptionId(spaceId)
    return [ postId, spaceIdOption ]
  }

  const renderTxButton = () => nonEmptyArr(spaceIds)
    ? <TxButton
      type='primary'
      label={`Move`}
      params={newTxParams}
      tx={'posts.movePost'}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      successMessage='Moved post to another space'
      failedMessage='Failed to move post'
    />
    : <CreateSpaceButton>Create one more space</CreateSpaceButton>

  const renderMovePostView = () => {
    if (isEmptyArray(spaceIds)) {
      return <NoData description='You need to have at least one more space to move post' />
    }

    return <div className={modalStyles.DfPostActionModalBody}>
      <span className={modalStyles.DfPostActionModalSelector}>
        <SelectSpacePreview
          spaceIds={spaceIds || []}
          onSelect={saveSpace}
          imageSize={24}
          defaultValue={spaceId?.toString()}
        />
      </span>

      <div style={{margin: '0.75rem 0'}}>
        <DynamicPostPreview id={postId} asRegularPost />
      </div>
    </div>
  }

  const saveSpace = (value: string | number | LabeledValue) => {
    setSpaceId(new BN(value as string))
  }

  return <Modal
    onCancel={onClose}
    visible={open}
    title={'Move post to another space'}
    className={modalStyles.DfPostActionModal}
    footer={
      <>
        <Button onClick={onClose}>Cancel</Button>
        {renderTxButton()}
      </>
    }
  >
    {renderMovePostView()}
  </Modal>
}

export const MoveModal = withMulti(
  InnerMoveModal,
  withMyAccount,
  withCalls<Props>(
    spacesQueryToProp(`spaceIdsByOwner`, { paramName: 'address', propName: 'spaceIds' })
  )
)
