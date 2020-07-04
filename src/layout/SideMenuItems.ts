import { accountUrl, spacesFollowedByAccountUrl, spacesOwnedByAccountUrl } from 'src/components/utils/urls'

export type Divider = 'Divider'

export const Divider: Divider = 'Divider'

export type PageLink = {
  name: string
  page: string[]
  image: string

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
    image: 'global'
  },
  {
    name: 'Advanced',
    page: [ '/bc' ],
    image: 'block',
    isAdvanced: true
  }
];

export const buildAuthorizedMenu = (myAddress: string): MenuItem[] => {
  const account = { address: myAddress }
  return [
    {
      name: 'My feed',
      page: [ '/feed' ],
      image: 'profile'
    },
    {
      name: 'My notifications',
      page: [ '/notifications' ],
      image: 'notification',
      isNotifications: true
    },
    {
      name: 'My subscriptions',
      page: [ '/spaces/following/[address]', spacesFollowedByAccountUrl(account) ],
      image: 'book'
    },
    {
      name: 'My profile',
      page: [ '/profile/[address]', accountUrl(account) ],
      image: 'user'
    },
    {
      name: 'My spaces',
      page: [ '/spaces/my/[address]', spacesOwnedByAccountUrl(account) ],
      image: 'book'
    },
    {
      name: 'New space',
      page: [ '/spaces/new' ],
      image: 'plus'
    },
    Divider,
    ...DefaultMenu
  ]
}
