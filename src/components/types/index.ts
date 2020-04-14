import { types } from '@subsocial/types/substrate/preparedTypes'
import { registry } from '@polkadot/react-api';
import { newLogger } from '@subsocial/utils';
const log = newLogger('types')
export const registerSubsocialTypes = (): void => {
  try {
    registry.register(types);
    log.info('Succesfully registered custom types of Subsocial modules')
  } catch (err) {
    log.error('Failed to register custom types of Subsocial modules:', err);
  }
};

// export type IpfsData = PostBlock | BlockValue;

export type PostBlockKind = 'text' | 'code' | 'link' | 'image' | 'video'

export interface PostBlock {
  kind: PostBlockKind
  hidden?: boolean

  /** CID aka IPFS hash */
  cid: string
}

export type BlockValueKind = BlockValue | CodeBlockValue

export interface BlockValue {
  id: number
  kind: PostBlockKind
  hidden?: boolean
  useOnPreview: boolean
  data: string
}

export interface CodeBlockValue extends BlockValue {
  lang: string
}

export type SharedPostContent = {
  blocks: PostBlock[]
};

export interface SiteMetaContent {
  og?: {
    title?: string,
    description?: string,
    image: string,
    url: string
  },
  title?: string,
  description?: string
}

export type PreviewData = {
  id: number,
  data: SiteMetaContent
}

export type EmbedData = {
  id: number,
  data: string,
  type: string
}

export default registerSubsocialTypes;
