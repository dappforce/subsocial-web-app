import { BareProps } from 'src/components/utils/types'
import { SpaceProps } from './common'

type Props = BareProps & SpaceProps & {
  withIcon?: boolean
}

export const EditMenuLink = ({ space: { id, owner }, withIcon }: Props) => /* isMyAddress(owner)
  ? <div className='SpaceNavSettings'>
    <Link
      href='/[spaceId]/space-navigation/edit'
      as={`/spaces/${id}/space-navigation/edit`}
    >
      <a className='DfSecondaryColor'>
        {withIcon && <SettingOutlined className='mr-2' />}
        Edit menu
      </a>
    </Link>
  </div>
  : */ null
