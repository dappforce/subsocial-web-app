import {
  EllipsisOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { AccountId } from '@polkadot/types/interfaces'
import { AnyAccountId } from '@subsocial/types'
import { ProfileContent } from '@subsocial/types/offchain'
import { SpaceId } from '@subsocial/types/substrate/interfaces'
import { isEmptyStr } from '@subsocial/utils'
import { Button, Dropdown, Menu } from 'antd'
import { NextPage } from 'next'
// import { ProfileHistoryModal } from '../utils/ListsEditHistory';
import dynamic from 'next/dynamic'
import Link from 'next/link'
import React, { useCallback, useState } from 'react'
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { fetchProfile, selectProfile } from 'src/rtk/features/profiles/profilesSlice'
import { ProfileData, SpaceData } from 'src/types'
import { mdToText } from 'src/utils'
import { AccountActivity } from '../activity/AccountActivity'
import { isMyAddress } from '../auth/MyAccountContext'
import { PageContent } from '../main/PageWrapper'
import { getAccountId } from '../substrate'
import { accountUrl } from '../urls'
import { DfMd } from '../utils/DfMd'
import { MutedDiv } from '../utils/MutedText'
import MyEntityLabel from '../utils/MyEntityLabel'
import { Pluralize } from '../utils/Plularize'
import Section from '../utils/Section'
import { AccountFollowersModal, AccountFollowingModal } from './AccountsListModal'
import Avatar from './address-views/Avatar'
import Name from './address-views/Name'
import { AccountSpacesLink, CopyAddress, EditProfileLink } from './address-views/utils'
import { Balance } from './address-views/utils/Balance'
import { withLoadedOwner, withMyProfile } from './address-views/utils/withLoadedOwner'

// import { KusamaRolesTags, KusamaIdentity } from '../substrate/KusamaContext';

const FollowAccountButton = dynamic(() => import('../utils/FollowAccountButton'), { ssr: false })

export type Props = {
  address: AnyAccountId,
  owner?: ProfileData,
  followers?: AccountId[],
  mySpaceIds?: SpaceId[],
  spacesData?: SpaceData[],
  size?: number
}

const Component = (props: Props) => {
  const {
    address,
    size = LARGE_AVATAR_SIZE,
    owner
  } = props

  const [ followersOpen, setFollowersOpen ] = useState(false)
  const [ followingOpen, setFollowingOpen ] = useState(false)

  const isMyAccount = isMyAddress(address)

  const noProfile = !owner?.struct.hasProfile
  const followers = owner ? owner.struct.followersCount : 0
  const following = owner ? owner.struct.followingAccountsCount : 0
  const reputation = owner ? owner.struct.reputation : 0

  const {
    avatar,
    about
  } = owner?.content || {} as ProfileContent

  const createProfileButton = noProfile && isMyAccount &&
    <Link href='/accounts/new' as='/accounts/new'>
      <Button type='primary' ghost>
        <PlusOutlined />
        Create profile
      </Button>
    </Link>

  const DropDownMenu = useCallback(() => {

    const menu = (
      <Menu>
        {isMyAccount && <Menu.Item key='0'>
          <EditProfileLink address={address} className='item' />
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>
    )

    return <>
      {isMyAccount &&
        <Dropdown overlay={menu} placement='bottomRight'>
          <EllipsisOutlined />
        </Dropdown>
      }
      {/* open && <ProfileHistoryModal id={id} open={open} close={close} /> */}
    </>
  }, [ address, isMyAccount ])

  const hasFollowers = followers > 0
  const hasFollowing = following > 0

  const followersText = <Pluralize count={followers} singularText='Follower' />
  const followingText = <Pluralize count={following} singularText='Following' />

  return (
    <Section className='mb-3'>
      <div className='d-flex'>
        <Avatar size={size || LARGE_AVATAR_SIZE} address={address} avatar={avatar} />
        <div className='ml-3 w-100'>
          <h1 className='header DfAccountTitle d-flex justify-content-between mb-2'>
            <span className='d-flex align-items-center'>
              <Name owner={owner} address={address} className='mr-3' />
              <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>
            </span>
            <DropDownMenu />
          </h1>
          {/* <KusamaRolesTags address={address} /> */}
          <MutedDiv>
            {'Address: '}
            <CopyAddress address={address}>
              <span className='DfGreyLink'>{address}</span>
            </CopyAddress>
          </MutedDiv>
          <MutedDiv><Balance address={address} label='Balance: ' /></MutedDiv>
          <MutedDiv>{`Reputation: ${reputation}`}</MutedDiv>
          <div className='about'>
            {about && <DfMd className='mt-3' source={about} />}
            {/* <KusamaIdentity address={address} /> */}
          </div>
          <div className='mt-3'>
            <span onClick={() => hasFollowers && setFollowersOpen(true)} className={`${!hasFollowers && 'disable'} DfProfileModalLink`}>{followersText}</span>
            <span onClick={() => hasFollowing && setFollowingOpen(true)} className={`${!hasFollowing && 'disable'} DfProfileModalLink`}>{followingText}</span>
            <AccountSpacesLink address={address} className='DfProfileModalLink' />
            <div className='mt-3'>
              {createProfileButton}
              <FollowAccountButton address={address} />
            </div>
          </div>
        </div>
      </div>
      {/* // TODO copypasta. See src/components/profiles/address-views/ProfilePreview.tsx */}
      {followersOpen && <AccountFollowersModal id={address} open={followersOpen} close={() => setFollowersOpen(false)} title={followersText} />}
      {followingOpen && <AccountFollowingModal id={address} open={followingOpen} close={() => setFollowingOpen(false)} title={followingText} />}
    </Section>
  )
}

const ProfilePage: NextPage<Props> = (props) => {
  const { address, owner, mySpaceIds } = props

  const {
    name,
    avatar,
    about
  } = owner?.content || {} as ProfileContent

  const isOnlyAddress = isEmptyStr(name)

  const getName = () => {
    if (isOnlyAddress) {
      return address.toString()
    } else {
      return name
    }
  }

  return <PageContent
    meta={{
      title: getName(),
      desc: mdToText(about),
      image: avatar,
      canonical: accountUrl({ address })
    }}
  >
    <Component {...props} />
    <AccountActivity address={address.toString()} mySpaceIds={mySpaceIds} />
  </PageContent>
}

getInitialPropsWithRedux(ProfilePage, async ({ context, subsocial, dispatch, reduxStore }) => {
  const { query: { address }, res } = context
  const { substrate } = subsocial

  const addressStr = address as string
  const accountId = await getAccountId(addressStr)

  if (!accountId) {
    if (res) {
      res.statusCode = 404
    }
    return { statusCode: 404 } as any
  }

  await dispatch(fetchProfile({ api: subsocial, id: addressStr }))
  const owner = selectProfile(reduxStore.getState(), addressStr)

  console.log('owner', owner)

  // TODO use redux
  const mySpaceIds = await substrate.spaceIdsByOwner(addressStr)

  return {
    address: accountId,
    owner,
    mySpaceIds: mySpaceIds.reverse()
  }
})

export default ProfilePage

export const ViewProfile = withLoadedOwner(Component)

export const ViewMyProfile = withMyProfile(Component)
