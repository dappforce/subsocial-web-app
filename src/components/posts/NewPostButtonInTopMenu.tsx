import styles from './NewPostButtonInTopMenu.module.sass'

import { PlusOutlined } from '@ant-design/icons'
import { newLogger } from '@subsocial/utils'
import React, { useState } from 'react'
import { Button, Modal } from 'antd'
import { useMyAddress } from '../auth/MyAccountContext'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { SpaceData } from 'src/types'
import { findSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { ViewSpace } from '../spaces/ViewSpace'
import { createNewPostLinkProps, CreateSpaceButton } from '../spaces/helpers'
import Link from 'next/link'
import { Loading } from '../utils'
import { NoData } from '../utils/EmptyList'
import { goToNewPostPage } from '../urls/goToPage'
import { useLoadSudo } from 'src/hooks/useLoadSudo'

const log = newLogger(NewPostButtonInTopMenu.name)

/**
 * The logic of this component:
 * - Shows "Create Space" in top menu if a current user has no spaces yet.
 * - Shows "New Post" in top menu if a current user has spaces.
 *   - Redirects to "New Post" page if user has only one space.
 *   - Opens "Space Selector" modal if user has more than one space.
 */
export function NewPostButtonInTopMenu () {
  const myAddress = useMyAddress()
  const sudo = useLoadSudo()
  const [ spacesData, setSpacesData ] = useState<SpaceData[]>()
  const [ open, setOpen ] = useState<boolean>(false)

  // TODO fix copypasta, see AccountSpaces
  useSubsocialEffect(({ flatApi, substrate }) => {
    if (/* !open || */ !sudo || !myAddress) return

    let isMounted = true

    // TODO use redux
    const loadSpaces = async () => {
      const mySpaceIds = await substrate.spaceIdsByOwner(myAddress)
      const withoutReservedSpaceIds = findSpaceIdsThatCanSuggestIfSudo(sudo, myAddress, mySpaceIds)
      const spacesData = await flatApi.findPublicSpaces(withoutReservedSpaceIds)
      isMounted && setSpacesData(spacesData)
    }

    loadSpaces().catch((err) => log.error(
      'Failed to load spaces by account', myAddress, err))

    return () => { isMounted = false }
  }, [ sudo?.toString(), myAddress?.toString() ])

  if (!spacesData) {
    return null
  }

  // console.table({
  //   sudo: sudo?.toString(),
  //   myAddress: myAddress?.toString()
  // })

  const closeModal = () => setOpen(false)

  /** Go to new post form or show the space selector modal. */
  const onNewPostClick = () => {
    if (spacesData && spacesData.length === 1) {
      // Redirect to the post edit form if a user has only one space
      closeModal()
      goToNewPostPage(spacesData[0].struct)
    } else {
      // Show space selector modal
      setOpen(true)
    }
  }

  const ListOfSpaces = () => {
    if (!spacesData) {
      return <Loading label='Loading your spaces...' />
    }
    
    if (!spacesData.length) {
      return (
        <NoData description={'You have no spaces'}>
          <CreateSpaceButton />
        </NoData>
      )
    }

    return <>{spacesData.map(s =>
      <div key={s.id} className={styles.DfSpacePreview}>
        <Link {...createNewPostLinkProps(s.struct)}>
          <ViewSpace onClick={closeModal} spaceData={s} miniPreview withFollowButton={false} />
        </Link>
      </div>
    )}</>
  }

  const NewPostButtonAndModal = () => <>
    <Button icon={<PlusOutlined />} onClick={onNewPostClick}>New post</Button>
    <Modal
      onCancel={closeModal}
      visible={open}
      width={600}
      title={'Choose a space for a new post'}
      footer={<Button onClick={closeModal}>Cancel</Button>}
    >
      <ListOfSpaces />
    </Modal>
  </>

  return !spacesData.length
    ? <CreateSpaceButton />
    : <NewPostButtonAndModal />
}