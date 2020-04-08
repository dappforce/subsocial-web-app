/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import { Option, Struct, Enum, EnumType } from '@polkadot/types/codec';
import { getTypeRegistry, BlockNumber, Moment, AccountId, u16, u32, u64, Text, Vector, i32, Null } from '@polkadot/types';
import BN from 'bn.js';
import { isServerSide } from '../utils';

export type IpfsData = CommentContent | PostContent | BlogContent | ProfileContent | SharedPostContent | PostBlock | BlockValue;

export type Activity = {
  id: number,
  account: string,
  event: string,
  following_id: string,
  blog_id: string,
  post_id: string,
  comment_id: string,
  date: Date,
  agg_count: number
};

export class Score extends i32 {
  public toHex (): string {
    // console.log('Score.toHex:', super.toHex(), '; is negative?', this.isNeg())
    const prefix = this.isNeg() && isServerSide() ? '-' : ''
    return prefix + super.toHex()
  }
}

export class BlogId extends u64 {}
export class PostId extends u64 {}
export class CommentId extends u64 {}
export class ReactionId extends u64 {}

export class IpfsHash extends Text {}
export class OptionIpfsHash extends Option.with(IpfsHash) {}

export class RegularPost extends Null {}
export class SharedPost extends PostId {}
export class SharedComment extends CommentId {}

export type PostExtensionEnum =
  RegularPost |
  SharedPost |
  SharedComment;

type PostExtensionEnumValue =
  { RegularPost: RegularPost } |
  { SharedPost: SharedPost } |
  { SharedComment: SharedComment };

export class PostExtension extends EnumType<PostExtensionEnumValue> {
  constructor (value?: PostExtensionEnumValue, index?: number) {
    super({
      RegularPost,
      SharedPost,
      SharedComment
    }, value, index);
  }
}

export type ChangeType = {
  account: AccountId,
  block: BlockNumber,
  time: Moment
};
export class Change extends Struct {
  constructor (value?: ChangeType) {
    super({
      account: AccountId,
      block: BlockNumber,
      time: Moment
    }, value);
  }

  get account (): AccountId {
    return this.get('account') as AccountId;
  }

  get block (): BlockNumber {
    return this.get('block') as BlockNumber;
  }

  get time (): number {
    const time = this.get('time') as Moment;
    return time.toNumber();
  }
}

export class VecAccountId extends Vector.with(AccountId) {}

export class OptionText extends Option.with(Text) {}
export class OptionChange extends Option.with(Change) {}
export class OptionBlogId extends Option.with(BlogId) {}
export class OptionCommentId extends Option.with(CommentId) {}
export class OptionVecAccountId extends Option.with(VecAccountId) {}

export type BlogContent = {
  name: string;
  desc: string;
  image: string;
  tags: string[];
};

export type BlogType = {
  id: BlogId;
  created: ChangeType;
  updated: OptionChange;
  writers: AccountId[];
  slug: Text;
  ipfs_hash: IpfsHash;
  posts_count: u16;
  followers_count: u32;
  edit_history: VecBlogHistoryRecord;
  score: Score;
};

export class Blog extends Struct {
  constructor (value?: BlogType) {
    super(
      {
        id: BlogId,
        created: Change,
        updated: OptionChange,
        writers: VecAccountId,
        slug: Text,
        ipfs_hash: IpfsHash,
        posts_count: u16,
        followers_count: u32,
        edit_history: VecBlogHistoryRecord,
        score: Score
      },
      value
    );
  }

  get id (): BlogId {
    return this.get('id') as BlogId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get writers (): VecAccountId {
    return this.get('writers') as VecAccountId;
  }

  get slug (): Text {
    return this.get('slug') as Text;
  }

  get ipfs_hash (): string {
    const ipfsHash = this.get('ipfs_hash') as Text;
    return ipfsHash.toString();
  }

  // get ipfs_hash (): BlogContent {
  //   const IpfsHash = this.get('ipfs_hash') as Text;
  //   return JSON.parse(IpfsHash.toString());
  // }

  get posts_count (): u16 {
    return this.get('posts_count') as u16;
  }

  get followers_count (): u32 {
    return this.get('followers_count') as u32;
  }

  get edit_history (): VecBlogHistoryRecord {
    return this.get('edit_history') as VecBlogHistoryRecord;
  }

  get score (): Score {
    return this.get('score') as Score;
  }
}

export type BlogUpdateType = {
  writers: OptionVecAccountId;
  slug: OptionText;
  ipfs_hash: OptionIpfsHash;
};

export class BlogUpdate extends Struct {
  constructor (value?: BlogUpdateType) {
    super(
      {
        writers: OptionVecAccountId,
        slug: OptionText,
        ipfs_hash: OptionIpfsHash
      },
      value
    );
  }

  get writers (): OptionVecAccountId {
    return this.get('writers') as OptionVecAccountId;
  }

  get slug (): OptionText {
    return this.get('slug') as OptionIpfsHash;
  }

  get ipfs_hash (): OptionIpfsHash {
    return this.get('ipfs_hash') as OptionIpfsHash;
  }

  set ipfs_hash (value: OptionIpfsHash) {
    this.set('ipfs_hash', value);
  }

  set slug (value: OptionText) {
    this.set('slug', value);
  }
}

// ------------------------------------------
// Post blocks

export type PostBlockKind = 'text' | 'code' | 'link' | 'image' | 'video'

export interface PostBlock {
  kind: PostBlockKind
  hidden?: boolean

  /** CID aka IPFS hash */
  cid: string
}

export type BlockValueKind = BlockValue | CodeBlockValue | ImageBlockValue

export interface BlockValue {
  id: number
  kind: PostBlockKind
  hidden?: boolean
  data: string
}

export interface CodeBlockValue extends BlockValue {
  lang: string
}

export interface ImageBlockValue extends BlockValue {
  useOnPreview: boolean
}

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

// type ImageFormat = 'jpeg' | 'png' | 'gif' | 'bmp' | 'webp' | string

// ----------------------------------------------------
// end post blocks

export type SharedPostContent = {
  blocks: PostBlock[]
};

export type PostContent = SharedPostContent & {
  title: string;
  image: string;
  tags: string[];
  canonical: string;
};

export type PostType = {
  id: PostId;
  blog_id: BlogId;
  created: ChangeType;
  updated: OptionChange;
  extension: PostExtension;
  ipfs_hash: IpfsHash;
  comments_count: u16;
  upvotes_count: u16;
  downvotes_count: u16;
  shares_count: u16;
  edit_history: VecPostHistoryRecord;
  score: Score;
};

export class Post extends Struct {
  constructor (value?: PostType) {
    super(
      {
        id: PostId,
        blog_id: BlogId,
        created: Change,
        updated: OptionChange,
        extension: PostExtension,
        ipfs_hash: IpfsHash,
        comments_count: u16,
        upvotes_count: u16,
        downvotes_count: u16,
        shares_count: u16,
        edit_history: VecPostHistoryRecord,
        score: Score
      },
      value
    );
  }

  get id (): PostId {
    return this.get('id') as PostId;
  }

  get blog_id (): BlogId {
    return this.get('blog_id') as BlogId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get extension (): PostExtension {
    return this.get('extension') as PostExtension;
  }

  get ipfs_hash (): string {
    const ipfsHash = this.get('ipfs_hash') as Text;
    return ipfsHash.toString();
  }

  get comments_count (): u16 {
    return this.get('comments_count') as u16;
  }

  get upvotes_count (): u16 {
    return this.get('upvotes_count') as u16;
  }

  get downvotes_count (): u16 {
    return this.get('downvotes_count') as u16;
  }

  get reactions_count (): BN {
    const downvotes = this.get('downvotes_count') as u16;
    const upvotes = this.get('upvotes_count') as u16;
    return downvotes.add(upvotes);
  }

  get shares_count (): u16 {
    return this.get('shares_count') as u16;
  }

  get edit_history (): VecPostHistoryRecord {
    return this.get('edit_history') as VecPostHistoryRecord;
  }

  get score (): Score {
    return this.get('score') as Score;
  }

  get isRegularPost (): boolean {
    return this.extension.value instanceof RegularPost;
  }

  get isSharedPost (): boolean {
    return this.extension.value instanceof SharedPost;
  }

  get isSharedComment (): boolean {
    return this.extension.value instanceof SharedComment;
  }
}

export type PostUpdateType = {
  blog_id: OptionBlogId;
  ipfs_hash: OptionIpfsHash;
};

export class PostUpdate extends Struct {
  constructor (value?: PostUpdateType) {
    super(
      {
        blog_id: OptionBlogId,
        ipfs_hash: OptionIpfsHash
      },
      value
    );
  }

  get ipfs_hash (): OptionIpfsHash {
    return this.get('ipfs_hash') as OptionIpfsHash;
  }

  set ipfs_hash (value: OptionIpfsHash) {
    this.set('ipfs_hash', value);
  }

  set slug (value: OptionText) {
    this.set('slug', value);
  }
}

export type CommentContent = {
  body: string;
};

export type CommentType = {
  id: CommentId;
  parent_id: OptionCommentId;
  post_id: PostId;
  created: Change;
  updated: OptionChange;
  ipfs_hash: IpfsHash;
  upvotes_count: u16;
  downvotes_count: u16;
  shares_count: u16;
  direct_replies_count: u16;
  edit_history: VecCommentHistoryRecord;
  score: Score;
};

export class Comment extends Struct {
  constructor (value?: CommentType) {
    super(
      {
        id: CommentId,
        parent_id: OptionCommentId,
        post_id: PostId,
        created: Change,
        updated: OptionChange,
        ipfs_hash: IpfsHash,
        upvotes_count: u16,
        downvotes_count: u16,
        shares_count: u16,
        direct_replies_count: u16,
        edit_history: VecCommentHistoryRecord,
        score: Score
      },
      value
    );
  }

  get id (): CommentId {
    return this.get('id') as CommentId;
  }

  get parent_id (): OptionCommentId {
    return this.get('parent_id') as OptionCommentId;
  }

  get post_id (): PostId {
    return this.get('post_id') as PostId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get ipfs_hash (): string {
    const ipfsHash = this.get('ipfs_hash') as Text;
    return ipfsHash.toString();
  }

  get upvotes_count (): u16 {
    return this.get('upvotes_count') as u16;
  }

  get downvotes_count (): u16 {
    return this.get('downvotes_count') as u16;
  }

  get reactions_count (): BN {
    const downvotes = this.get('downvotes_count') as u16;
    const upvotes = this.get('upvotes_count') as u16;
    return downvotes.add(upvotes);
  }

  get shares_count (): u16 {
    return this.get('shares_count') as u16;
  }

  get direct_replies_count (): u16 {
    return this.get('direct_replies_count') as u16;
  }

  get edit_history (): VecCommentHistoryRecord {
    return this.get('edit_history') as VecCommentHistoryRecord;
  }

  get score (): Score {
    return this.get('score') as Score;
  }
}

export type CommentUpdateType = {
  ipfs_hash: IpfsHash;
};

export class CommentUpdate extends Struct {
  constructor (value?: CommentUpdateType) {
    super(
      {
        ipfs_hash: IpfsHash
      },
      value
    );
  }

  get ipfs_hash (): IpfsHash {
    return this.get('ipfs_hash') as IpfsHash;
  }
}

export class OptionComment extends Option.with(Comment) {}

export const ReactionKinds: { [key: string]: string } = {
  Upvote: 'Upvote',
  Downvote: 'Downvote'
};

export class ReactionKind extends Enum {
  constructor (value?: any) {
    super([ 'Upvote', 'Downvote' ], value);
  }
}

export type ReactionType = {
  id: ReactionId;
  created: Change;
  updated: OptionChange;
  kind: ReactionKind;
};

export class Reaction extends Struct {
  constructor (value?: ReactionType) {
    super(
      {
        id: ReactionId,
        created: Change,
        updated: OptionChange,
        kind: ReactionKind
      },
      value
    );
  }

  get id (): ReactionId {
    return this.get('id') as ReactionId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get kind (): ReactionKind {
    return this.get('kind') as ReactionKind;
  }
}

export type SocialAccountType = {
  followers_count: u32;
  following_accounts_count: u16;
  following_blogs_count: u16;
  reputation: u32;
  profile: OptionProfile;
};

export class SocialAccount extends Struct {
  constructor (value?: SocialAccountType) {
    super(
      {
        followers_count: u32,
        following_accounts_count: u16,
        following_blogs_count: u16,
        reputation: u32,
        profile: OptionProfile
      },
      value
    );
  }

  get followers_count (): u32 {
    return this.get('followers_count') as u32;
  }

  get following_accounts_count (): u16 {
    return this.get('following_accounts_count') as u16;
  }

  get following_blogs_count (): u16 {
    return this.get('following_blogs_count') as u16;
  }

  get reputation (): u32 {
    return this.get('reputation') as u32;
  }

  get profile (): OptionProfile {
    return this.get('profile') as OptionProfile;
  }
}

export type ProfileContent = {
  fullname: string;
  avatar: string;
  email: string;
  personal_site: string;
  about: string;
  facebook: string;
  twitter: string;
  linkedIn: string;
  github: string;
  instagram: string;
};

export type ProfileType = {
  created: ChangeType;
  updated: OptionChange;
  username: Text;
  ipfs_hash: IpfsHash;
  edit_history: VecProfileHistoryRecord;
};

export class Profile extends Struct {
  constructor (value?: ProfileType) {
    super(
      {
        created: Change,
        updated: OptionChange,
        username: Text,
        ipfs_hash: IpfsHash,
        edit_history: VecProfileHistoryRecord
      },
      value
    );
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get username (): Text {
    return this.get('username') as Text;
  }

  get ipfs_hash (): string {
    const ipfsHash = this.get('ipfs_hash') as Text;
    return ipfsHash.toString();
  }

  get edit_history (): VecProfileHistoryRecord {
    return this.get('edit_history') as VecProfileHistoryRecord;
  }
}

export class OptionProfile extends Option.with(Profile) {}

export type ProfileUpdateType = {
  username: OptionText;
  ipfs_hash: OptionIpfsHash;
};

export class ProfileUpdate extends Struct {
  constructor (value?: ProfileUpdateType) {
    super(
      {
        username: OptionText,
        ipfs_hash: OptionIpfsHash
      },
      value
    );
  }

  get ipfs_hash (): OptionIpfsHash {
    return this.get('ipfs_hash') as OptionIpfsHash;
  }

  get username (): OptionIpfsHash {
    return this.get('username') as OptionIpfsHash;
  }

  set ipfs_hash (value: OptionIpfsHash) {
    this.set('ipfs_hash', value);
  }

  set username (value: OptionText) {
    this.set('username', value);
  }
}

export type BlogHistoryRecordType = {
  edited: ChangeType;
  old_data: BlogUpdateType;
};

export class BlogHistoryRecord extends Struct {
  constructor (value?: BlogHistoryRecordType) {
    super(
      {
        edited: Change,
        old_data: BlogUpdate
      },
      value
    );
  }

  get edited (): Change {
    return this.get('edited') as Change;
  }

  get old_data (): BlogUpdate {
    return this.get('old_data') as BlogUpdate;
  }
}

export class VecBlogHistoryRecord extends Vector.with(BlogHistoryRecord) {}

export type PostHistoryRecordType = {
  edited: ChangeType;
  old_data: PostUpdateType;
};

export class PostHistoryRecord extends Struct {
  constructor (value?: PostHistoryRecordType) {
    super(
      {
        edited: Change,
        old_data: PostUpdate
      },
      value
    );
  }

  get edited (): Change {
    return this.get('edited') as Change;
  }

  get old_data (): PostUpdate {
    return this.get('old_data') as PostUpdate;
  }
}

export class VecPostHistoryRecord extends Vector.with(PostHistoryRecord) {}

export type CommentHistoryRecordType = {
  edited: ChangeType;
  old_data: CommentUpdateType;
};

export class CommentHistoryRecord extends Struct {
  constructor (value?: CommentHistoryRecordType) {
    super(
      {
        edited: Change,
        old_data: CommentUpdate
      },
      value
    );
  }

  get edited (): Change {
    return this.get('edited') as Change;
  }

  get old_data (): CommentUpdate {
    return this.get('old_data') as CommentUpdate;
  }
}

export class VecCommentHistoryRecord extends Vector.with(CommentHistoryRecord) {}

export type ProfileHistoryRecordType = {
  edited: ChangeType;
  old_data: ProfileUpdateType;
};

export class ProfileHistoryRecord extends Struct {
  constructor (value?: ProfileHistoryRecordType) {
    super(
      {
        edited: Change,
        old_data: ProfileUpdate
      },
      value
    );
  }

  get edited (): Change {
    return this.get('edited') as Change;
  }

  get old_data (): ProfileUpdate {
    return this.get('old_data') as ProfileUpdate;
  }
}

export class VecProfileHistoryRecord extends Vector.with(ProfileHistoryRecord) {}

export const ScoringActions: { [key: string]: string } = {
  UpvotePost: 'UpvotePost',
  DownvotePost: 'DownvotePost',
  SharePost: 'SharePost',
  UpvoteComment: 'UpvoteComment',
  DownvoteComment: 'DownvoteComment',
  ShareComment: 'ShareComment',
  FollowBlog: 'FollowBlog',
  FollowAccount: 'FollowAccount'
};

export class ScoringAction extends Enum {
  constructor (value?: any) {
    super(
      [
        'UpvotePost',
        'DownvotePost',
        'SharePost',
        'UpvoteComment',
        'DownvoteComment',
        'ShareComment',
        'FollowBlog',
        'FollowAccount'
      ],
      value
    );
  }
}

export function registerSubsocialTypes () {
  try {
    const typeRegistry = getTypeRegistry();
    typeRegistry.register({
      BlogId,
      PostId,
      CommentId,
      ReactionId,
      Change,
      Blog,
      BlogUpdate,
      BlogHistoryRecord,
      PostExtension,
      Post,
      PostUpdate,
      PostHistoryRecord,
      Comment,
      CommentUpdate,
      CommentHistoryRecord,
      ReactionKind,
      Reaction,
      SocialAccount,
      ScoringAction,
      Profile,
      ProfileUpdate,
      ProfileHistoryRecord
    });
  } catch (err) {
    console.error('Failed to register custom types of blogs module', err);
  }
}
