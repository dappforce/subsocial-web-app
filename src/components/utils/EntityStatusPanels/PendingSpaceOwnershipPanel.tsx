import { Option } from '@polkadot/types'
import AccountId from '@polkadot/types/generic/AccountId'
import { newLogger } from '@subsocial/utils'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useMyAddress } from 'src/components/auth/MyAccountContext'
import { ViewProfileLink } from 'src/components/profiles/ViewProfileLink'
import { equalAddresses } from 'src/components/substrate'
import { TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { SpaceStruct } from 'src/types'
import { EntityStatusPanel, EntityStatusProps } from './EntityStatusPanel'

const TxButton = dynamic(() => import('src/components/utils/TxButton'), { ssr: false })

const log = newLogger('PendingSpaceOwnershipPanel')

type Props = EntityStatusProps & {
  space: SpaceStruct
}

export const PendingSpaceOwnershipPanel = ({
  space,
  ...otherProps
}: Props) => {

  const { preview } = otherProps
  const myAddress = useMyAddress()
  const [ pendingOwner, setPendingOwner ] = useState<AccountId>()
  const spaceId = space.id
  const currentOwner = space.ownerId

  useSubsocialEffect(({ substrate }) => {
    let isMounted = true
    let unsub: (() => void) | undefined

    const sub = async () => {
      const api = await substrate.api
      unsub = await api.query.spaceOwnership.pendingSpaceOwner(spaceId, (res) => {
        if (isMounted && res) {
          const maybePendingOwner = res as Option<AccountId>
          setPendingOwner(maybePendingOwner.unwrapOr(undefined))
        }
      })
    }

    isMounted && sub().catch(err => log.error('Failed to load a pending owner:', err))

    return () => {
      unsub && unsub()
      isMounted = false
    }
  }, [ spaceId?.toString(), currentOwner?.toString() ])

  if (!myAddress || !pendingOwner) return null

  const iAmCurrentOwner = equalAddresses(myAddress, currentOwner)

  const iAmPendingOwner = equalAddresses(myAddress, pendingOwner)
  
  const getTxParams = () => [ spaceId ]

  const onSuccess: TxCallback = () => {
    setPendingOwner(undefined)
  }

  const AcceptOwnershipButton = () =>
    <TxButton
      size='small'
      tx={'spaceOwnership.acceptPendingOwnership'}
      params={getTxParams}
      onSuccess={onSuccess}
      label='Accept'
      successMessage={'You accepted a space ownership'}
      failedMessage={'Failed to accepted a space ownership'}
    />

  const RejectOwnershipButton = () =>
    <TxButton
      size='small'
      tx={'spaceOwnership.rejectPendingOwnership'}
      params={getTxParams}
      onSuccess={onSuccess}
      label={iAmCurrentOwner
        ? 'Cancel transfer'
        : 'Reject'
      }
      successMessage={iAmCurrentOwner
        ? 'You canceled the transfer of ownership'
        : 'You rejected the space ownership'
      }
      failedMessage={iAmCurrentOwner
        ? 'Failed to cancel the transfer of ownership'
        : 'Failed to rejected the space ownership'
      }
    />

  if (iAmPendingOwner) {
    return <EntityStatusPanel
      {...otherProps}
      desc={<span className='mr-2'>Accept ownership of this space?</span>}
      actions={[
        <AcceptOwnershipButton key='accept' />,
        <RejectOwnershipButton key='reject' />
      ]}
    />
  } else if (iAmCurrentOwner) {
    const transferInProgressMsg = <>Transfer of ownership is in progress</>
    const desc = preview
      ? transferInProgressMsg
      : <>
        <span className='mr-1'>{transferInProgressMsg}. Pending owner: </span>
        <b><ViewProfileLink account={{ address: pendingOwner! }} className='DfBlackLink' /></b>
      </>

    return <EntityStatusPanel
      {...otherProps}
      desc={<span className='mr-2'>{desc}</span>}
      actions={[ <RejectOwnershipButton key='reject' /> ]}
    />
  }
  
  return null
}
