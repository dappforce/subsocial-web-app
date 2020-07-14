import { accountUrl, spacesFollowedByAccountUrl, spacesOwnedByAccountUrl } from 'src/components/utils/urls'
import { GlobalOutlined, BlockOutlined, ProfileOutlined, BellOutlined, StarOutlined, UserOutlined, BookOutlined, PlusOutlined } from '@ant-design/icons'

export type Divider = 'Divider'

export const Divider: Divider = 'Divider'

export type PageLink = {
  name: string
  page: string[]
  icon: React.ForwardRefExoticComponent<any>

  // Helpers
  isNotifications?: boolean
  isAdvanced?: boolean
}

type MenuItem = PageLink | Divider

export const isDivider = (item: MenuItem): item is Divider =>
  item === Divider

export const isPageLink = (item: MenuItem): item is PageLink =>
  !isDivider(item)

export const DefaultMenu: MenuItem[] = [
  {
    name: 'Explore',
    page: [ '/spaces/all' ],
    icon: GlobalOutlined
  },
  {
    name: 'Advanced',
    page: [ '/bc' ],
    icon: BlockOutlined,
    isAdvanced: true
  }
];

export const buildAuthorizedMenu = (myAddress: string): MenuItem[] => {
  const account = { address: myAddress }
  return [
    {
      name: 'My feed',
      page: [ '/feed' ],
      icon: ProfileOutlined
    },
    {
      name: 'My notifications',
      page: [ '/notifications' ],
      icon: BellOutlined,
      isNotifications: true
    },
    {
      name: 'My subscriptions',
      page: [ '/spaces/following/[address]', spacesFollowedByAccountUrl(account) ],
      icon: StarOutlined
    },
    {
      name: 'My profile',
      page: [ '/profile/[address]', accountUrl(account) ],
      icon: UserOutlined
    },
    {
      name: 'My spaces',
      page: [ '/spaces/my/[address]', spacesOwnedByAccountUrl(account) ],
      icon: BookOutlined
    },
    {
      name: 'New space',
      page: [ '/spaces/new' ],
      icon: PlusOutlined
    },
    Divider,
    ...DefaultMenu
  ]
}
