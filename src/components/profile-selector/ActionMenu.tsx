import { EditOutlined, StarOutlined, UserOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import React, { useState } from 'react'
import { useMyAccount } from '../auth/MyAccountContext'
import { AccountFollowersModal, AccountFollowingModal } from '../profiles/AccountsListModal'
import { EditProfileLink } from '../profiles/address-views/utils'
import { Pluralize } from '../utils/Plularize'
import { useMyAccountDrawer } from './MyAccountMenu'

export const ActionMenu = () => {
  const [ followersOpen, setFollowersOpen ] = useState(false)
  const [ followingOpen, setFollowingOpen ] = useState(false)
  const { close } = useMyAccountDrawer()

  const { state: { account, address }} = useMyAccount()
  const accountStruct = account?.struct

  if (!accountStruct || !address) return null

  const { followersCount, followingAccountsCount: followingsCount } = accountStruct

  const openFollowersModal = () => {
    if (!followersCount) return

    setFollowersOpen(true)
  }

  const openFollowingModal = () => {
    if (!followingsCount) return

    setFollowingOpen(true)
  }

  // TODO should we show both followingAccountsCount and followingSpacesCount
  // or even merge them into one modal?

  return <>
    <Menu className='FontNormal'>
      <Menu.Item key="following" onClick={openFollowingModal} icon={<StarOutlined />}>
        {`My followings (${followingsCount})`}
      </Menu.Item>
      <Menu.Item key="follower" onClick={openFollowersModal} icon={<UserOutlined />}>
        {`My followers (${followersCount})`}
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        <EditProfileLink address={address} onClick={close} />
      </Menu.Item>
    </Menu>
    {followersOpen && <AccountFollowersModal
      id={address}
      open={followersOpen}
      close={() => setFollowersOpen(false)}
      title={<Pluralize count={followersCount} singularText='Follower' />}
    />}
    {followingOpen && <AccountFollowingModal
      id={address}
      open={followingOpen}
      close={() => setFollowingOpen(false)}
      title={<Pluralize count={followingsCount} singularText='Following' />}
    />}
  </>
}