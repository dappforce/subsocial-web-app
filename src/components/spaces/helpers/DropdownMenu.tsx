import { EllipsisOutlined } from '@ant-design/icons'
import { SpaceData } from '@subsocial/types/dto'
import { Dropdown, Menu } from 'antd'
import Link from 'next/link'
import React from 'react'
import { editSpaceUrl } from 'src/components/urls'
import { BareProps } from 'src/components/utils/types'
import HiddenSpaceButton from '../HiddenSpaceButton'
import { TransferOwnershipLink } from '../TransferSpaceOwnership'
import { isHiddenSpace, createNewPostLinkProps, isMySpace } from './common'

type Props = BareProps & {
  spaceData: SpaceData
  vertical?: boolean
}

export const DropdownMenu = (props: Props) => {
  const { spaceData: { struct }, vertical, style, className } = props
  const { id } = struct
  const spaceKey = `space-${id.toString()}`

  const buildMenu = () =>
    <Menu>
      <Menu.Item key={`edit-space-${spaceKey}`}>
        <Link href={'/[spaceId]/edit'} as={editSpaceUrl(struct)}>
          <a className='item'>Edit space</a>
        </Link>
      </Menu.Item>
      {/* <Menu.Item key={`edit-nav-${spaceKey}`}>
        <EditMenuLink space={struct} className='item' />
      </Menu.Item> */}
      {isHiddenSpace(struct)
        ? null
        : <Menu.Item key={`create-post-${spaceKey}`}>
          <Link {...createNewPostLinkProps(struct)}>
            <a className='item'>Write post</a>
          </Link>
        </Menu.Item>
      }
      <Menu.Item key={`hidden-${spaceKey}`}>
        <HiddenSpaceButton space={struct} asLink />
      </Menu.Item>
      {<Menu.Item key={`transfer-ownership-${spaceKey}`}>
        <TransferOwnershipLink space={struct} />
      </Menu.Item>}
    </Menu>

  return isMySpace(struct)
    ? <Dropdown overlay={buildMenu()} placement='bottomRight'>
      <EllipsisOutlined rotate={vertical ? 90 : 0} style={style} className={className} />
    </Dropdown>
    : null
}
