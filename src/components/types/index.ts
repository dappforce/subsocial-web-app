import { Option, Struct, Enum } from '@polkadot/types';
import { getTypeRegistry, u16, u32, u64, Text, Vec as Vector, i32, Null, bool } from '@polkadot/types';
import { GenericAccountId } from '@polkadot/types';
import { BlockNumber, Moment, AccountId } from '@polkadot/types/interfaces';
import BN from 'bn.js';

export type IpfsData = CommentContent | PostContent | SpaceContent | ProfileContent | SharedPostContent;

export type Activity = {
  id: number,
  account: string,
  event: string,
  following_id: string,
  space_id: string,
  post_id: string,
  comment_id: string,
  date: Date,
  agg_count: number
};

export class SpaceId extends u64 {}
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

export class PostExtension extends Enum {
  constructor (value?: any, index?: number) {
    super({
      RegularPost,
      SharedPost,
      SharedComment
    }, value, index);
  }
}

export type SpacedAccountType = {
  account: AccountId,
  space: OptionSpaceId
}
export class SpacedAccount extends Struct {
  constructor (value?: ChangeType) {
    super({
      account: GenericAccountId,
      space: OptionSpaceId,
    }, value);
  }

  get account (): AccountId {
    return this.get('account') as AccountId;
  }

  get space (): OptionSpaceId {
    return this.get('space') as OptionSpaceId;
  }
}

export type ChangeType = {
  on_behalf: SpacedAccountType,
  block: BlockNumber,
  time: Moment
};
export class Change extends Struct {
  constructor (value?: ChangeType) {
    super({
      on_behalf: SpacedAccount,
      block: u32,
      time: u64
    }, value);
  }

  get on_behalf (): SpacedAccount {
    return this.get('on_behalf') as SpacedAccount;
  }

  get block (): BlockNumber {
    return this.get('block') as BlockNumber;
  }

  get time (): number {
    return (this.get('time') as Moment).toNumber();
  }
}

export class VecAccountId extends Vector.with(GenericAccountId) {}

export class OptionBool extends Option.with(bool) {}
export class OptionText extends Option.with(Text) {}
export class OptionChange extends Option.with(Change) {}
export class OptionSpaceId extends Option.with(SpaceId) {}
export class OptionCommentId extends Option.with(CommentId) {}
export class OptionVecAccountId extends Option.with(VecAccountId) {}

export type SpaceContent = {
  name: string;
  desc: string;
  image: string;
  tags: string[];
};

export type SpaceType = {
  id: SpaceId;
  created: ChangeType;
  updated: OptionChange;
  hidden: bool;
  // owners: AccountId[];
  handle: Text;
  ipfs_hash: OptionIpfsHash;
  edit_history: VecSpaceHistoryRecord;
  followers_count: u32;
  following_count: u16;
  posts_count: u16;
  score: i32;
};

export class Space extends Struct {
  constructor (value?: SpaceType) {
    super(
      {
        id: SpaceId,
        created: Change,
        updated: OptionChange,
        hidden: bool,
        // owners: VecAccountId,
        handle: Text,
        ipfs_hash: OptionIpfsHash,
        edit_history: VecSpaceHistoryRecord,
        followers_count: u32,
        following_count: u16,
        posts_count: u16,
        score: i32
      },
      value
    );
  }

  get id (): SpaceId {
    return this.get('id') as SpaceId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get hidden (): bool {
    return this.get('hidden') as bool;
  }

  // get owners (): VecAccountId {
  //   return this.get('owners') as VecAccountId;
  // }

  get handle (): Text {
    return this.get('handle') as Text;
  }

  get ipfs_hash (): string {
    const ipfsHash = this.get('ipfs_hash') as Text;
    return ipfsHash.toString();
  }

  // get ipfs_hash (): SpaceContent {
  //   const IpfsHash = this.get('ipfs_hash') as Text;
  //   return JSON.parse(IpfsHash.toString());
  // }
  
  get edit_history (): VecSpaceHistoryRecord {
    return this.get('edit_history') as VecSpaceHistoryRecord;
  }

  get followers_count (): u32 {
    return this.get('followers_count') as u32;
  }

  get following_count (): u16 {
    return this.get('following_count') as u16;
  }
  
  get posts_count (): u16 {
    return this.get('posts_count') as u16;
  }

  get score (): i32 {
    return this.get('score') as i32;
  }
}

export type SpaceUpdateType = {
  // owners: OptionVecAccountId;
  handle: OptionText;
  ipfs_hash: OptionIpfsHash;
  hidden: OptionBool;
};

export class SpaceUpdate extends Struct {
  constructor (value?: SpaceUpdateType) {
    super(
      {
        // owners: OptionVecAccountId,
        handle: OptionText,
        ipfs_hash: OptionIpfsHash,
        hidden: OptionBool
      },
      value
    );
  }
  // get owners (): OptionVecAccountId {
  //   return this.get('owners') as OptionVecAccountId;
  // }

  get handle (): OptionText {
    return this.get('handle') as OptionIpfsHash;
  }

  get ipfs_hash (): OptionIpfsHash {
    return this.get('ipfs_hash') as OptionIpfsHash;
  }

  get hidden (): OptionBool {
    return this.get('hidden') as OptionBool;
  }

  set ipfs_hash (value: OptionIpfsHash) {
    this.set('ipfs_hash', value);
  }

  set handle (value: OptionText) {
    this.set('handle', value);
  }

  set hidden (value: OptionBool) {
    this.set('hidden', value);
  }
}

export type SharedPostContent = {
  body: string
};

export type PostContent = SharedPostContent & {
  title: string;
  image: string;
  tags: string[];
};

export type PostType = {
  id: PostId;
  space_id: SpaceId;
  created: ChangeType;
  updated: OptionChange;
  hidden: bool;
  extension: PostExtension;
  ipfs_hash: IpfsHash;
  comments_count: u16;
  upvotes_count: u16;
  downvotes_count: u16;
  shares_count: u16;
  edit_history: VecPostHistoryRecord;
  score: i32;
};

export class Post extends Struct {
  constructor (value?: PostType) {
    super(
      {
        id: PostId,
        space_id: SpaceId,
        created: Change,
        updated: OptionChange,
        hidden: bool,
        extension: PostExtension,
        ipfs_hash: IpfsHash,
        comments_count: u16,
        upvotes_count: u16,
        downvotes_count: u16,
        shares_count: u16,
        edit_history: VecPostHistoryRecord,
        score: i32
      },
      value
    );
  }

  get id (): PostId {
    return this.get('id') as PostId;
  }

  get space_id (): SpaceId {
    return this.get('space_id') as SpaceId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }
  
  get hidden (): bool {
    return this.get('hidden') as bool;
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

  get score (): BN {
    return new BN(this.get('score') as i32);
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
  space_id: OptionSpaceId;
  ipfs_hash: OptionIpfsHash;
  hidden: OptionBool;
};

export class PostUpdate extends Struct {
  constructor (value?: PostUpdateType) {
    super(
      {
        space_id: OptionSpaceId,
        ipfs_hash: OptionIpfsHash,
        hidden: OptionBool
      },
      value
    );
  }

  get ipfs_hash (): OptionIpfsHash {
    return this.get('ipfs_hash') as OptionIpfsHash;
  }
  
  get hidden (): OptionBool {
    return this.get('hidden') as OptionBool;
  }

  set ipfs_hash (value: OptionIpfsHash) {
    this.set('ipfs_hash', value);
  }

  set hidden (value: OptionBool) {
    this.set('hidden', value);
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
  hidden: bool;
  ipfs_hash: IpfsHash;
  upvotes_count: u16;
  downvotes_count: u16;
  shares_count: u16;
  direct_replies_count: u16;
  edit_history: VecCommentHistoryRecord;
  score: i32;
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
        hidden: bool,
        ipfs_hash: IpfsHash,
        upvotes_count: u16,
        downvotes_count: u16,
        shares_count: u16,
        direct_replies_count: u16,
        edit_history: VecCommentHistoryRecord,
        score: i32
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
  
  get hidden (): bool {
    return this.get('hidden') as bool;
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

  get score (): i32 {
    return this.get('score') as i32;
  }
}

export type CommentUpdateType = {
  ipfs_hash: OptionIpfsHash;
  hidden: OptionBool;
};

export class CommentUpdate extends Struct {
  constructor (value?: CommentUpdateType) {
    super(
      {
        ipfs_hash: OptionIpfsHash,
        hidden: OptionBool
      },
      value
    );
  }

  get ipfs_hash (): OptionIpfsHash {
    return this.get('ipfs_hash') as OptionIpfsHash;
  }
  
  get hidden (): OptionBool {
    return this.get('hidden') as OptionBool;
  }
 
  set ipfs_hash (value: OptionIpfsHash) {
    this.set('ipfs_hash', value);
  }

  set hidden (value: OptionBool) {
    this.set('hidden', value);
  }
}

export class OptionComment extends Option.with(Comment) {}

export const ReactionKinds: { [key: string]: string } = {
  Upvote: 'Upvote',
  Downvote: 'Downvote'
};

export class ReactionKind extends Enum {
  constructor (value?: any) {
    super(['Upvote', 'Downvote'], value);
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

export type SpaceHistoryRecordType = {
  edited: ChangeType;
  old_data: SpaceUpdateType;
};

export class SpaceHistoryRecord extends Struct {
  constructor (value?: SpaceHistoryRecordType) {
    super(
      {
        edited: Change,
        old_data: SpaceUpdate
      },
      value
    );
  }

  get edited (): Change {
    return this.get('edited') as Change;
  }

  get old_data (): SpaceUpdate {
    return this.get('old_data') as SpaceUpdate;
  }
}

export class VecSpaceHistoryRecord extends Vector.with(SpaceHistoryRecord) {}

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

export function registerSubsocialTypes () {
  try {
    const typeRegistry = getTypeRegistry();
    typeRegistry.register({
      SpaceId,
      PostId,
      CommentId,
      ReactionId,
      Change,
      Space,
      SpaceUpdate,
      SpaceHistoryRecord,
      PostExtension,
      Post,
      PostUpdate,
      PostHistoryRecord,
      Comment,
      CommentUpdate,
      CommentHistoryRecord,
      ReactionKind,
      Reaction,
    });
  } catch (err) {
    console.error('Failed to register custom types of social module', err);
  }
}
