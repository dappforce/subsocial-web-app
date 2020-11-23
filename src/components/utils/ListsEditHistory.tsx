import React from 'react'
// import { withMulti, withCalls } from '../substrate';
// import { Modal, Comment as SuiComment, Button } from 'semantic-ui-react';
// import { Post, Space, PostId, SpaceId, CommentId, Comment, SpaceHistoryRecord, CommentHistoryRecord, PostHistoryRecord, ProfileHistoryRecord, Profile, VecProfileHistoryRecord, SocialAccount, OptionText } from '@subsocial/types/substrate/interfaces/subsocial';
// import { PostContent, SpaceContent, CommentContent, ProfileContent } from '../types';
// import { socialQueryToProp } from './index';
// import { Option } from '@polkadot/types';
// import { DfMd } from './DfMd';
// import IdentityIcon from 'src/components/utils/IdentityIcon';
// import Link from 'next/link';
// import { getJsonFromIpfs } from './OffchainUtils';
// import { withRequireProfile, withSocialAccount, Loading } from './utils';
// import { NoData } from './EmptyList';
// import { DfBgImg } from './DfBgImg';
// import dynamic from 'next/dynamic';
// import { AccountId } from '@polkadot/types/interfaces';
export default <></>

// const AddressComponents = dynamic(() => import('./AddressComponents'), { ssr: false });

// type ModalController = {
//   open: boolean,
//   close: () => void
// };

// function fillHistory<T extends (SpaceHistoryRecord | ProfileHistoryRecord)[]> (historyLast: T) {
//   if (historyLast[0] === undefined) return;

//   const stringForHandleOrUsername = /* historyLast[0] instanceof ProfileHistoryRecord ? 'username' : */ 'handle'; // TODO fix after run;

//   const history = [ ...historyLast ];
//   let IpfsCid = history[0].old_data.ipfs_hash;
//   let handle = history[0].old_data.get(stringForHandleOrUsername) as OptionText;

//   if (IpfsCid.isNone) {
//     for (let i = 1; i < history.length; i++) {
//       if (history[i].old_data.ipfs_hash.isSome) {
//         IpfsCid = history[i].old_data.ipfs_hash;
//         break;
//       }
//     }
//   }

//   if (handle.isNone) {
//     for (let i = 1; i < history.length; i++) {
//       const _handle = history[i].old_data.get(stringForHandleOrUsername) as OptionText;
//       if (_handle.isSome) {
//         handle = _handle;
//         break;
//       }
//     }
//   }

//   return history.map(record => {
//     if (record.old_data.ipfs_hash.isNone) {
//       record.old_data.ipfs_hash = IpfsCid;
//     } else {
//       IpfsCid = record.old_data.ipfs_hash;
//     }
//     const _handle = record.old_data.get(stringForHandleOrUsername) as OptionText;
//     if (_handle.isNone) {
//       record.old_data.set(stringForHandleOrUsername, handle);
//     } else {
//       handle = _handle;
//     }
//     return record;
//   }).reverse() as T;
// }

// function fillHistoryForPost<T extends PostHistoryRecord[]> (historyLast: T) {
//   if (historyLast[0] === undefined) return;

//   const history = [ ...historyLast ];
//   let IpfsCid = history[0].old_data.ipfs_hash;

//   if (IpfsCid.isNone) {
//     for (let i = 1; i < history.length; i++) {
//       if (history[i].old_data.ipfs_hash.isSome) {
//         IpfsCid = history[i].old_data.ipfs_hash;
//         break;
//       }
//     }
//   }

//   return history.map(record => {
//     if (record.old_data.ipfs_hash.isNone) {
//       record.old_data.ipfs_hash = IpfsCid;
//     } else {
//       IpfsCid = record.old_data.ipfs_hash;
//     }
//     return record;
//   }).reverse() as T;
// }

// type PropsCommentFromHistory = {
//   history: CommentHistoryRecord
// };

// const CommentFromHistory = (props: PropsCommentFromHistory) => {
//   const { history: { old_data, edited } } = props;
//   const { ipfs_hash } = old_data;
//   const [ content, setContent ] = useState({} as CommentContent);

//   useEffect(() => {
//     const loadData = async () => {
//       const data = await getJsonFromIpfs<CommentContent>(ipfs_hash.toString());
//       setContent(data);
//     };
//     loadData().catch(err => new Error(err));
//   }, [ ipfs_hash ]);

//   return (<div className='DfModal'>
//     <SuiComment>
//       <SuiComment.Metadata>
//         <AddressComponents
//           value={edited.account}
//           isShort={true}
//           isPadded={false}
//           size={28}
//           extraDetails={`${edited.time.toLocaleString()} at block #${edited.block.toNumber()}`}
//         />
//       </SuiComment.Metadata>
//       <SuiComment.Text>{content.body}</SuiComment.Text>
//     </SuiComment>
//   </div>);
// };

// type CommentHistoryProps = ModalController & {
//   id: CommentId
//   commentOpt?: OptionComment
// };

// const InnerCommentHistoryModal = (props: CommentHistoryProps) => {
//   const { open, close, commentOpt } = props;

//   if (commentOpt === undefined) return <Modal><Loading /></Modal>;
//   else if (commentOpt.isNone) return <Modal><NoData description={<span>Comment not found</span>} /></Modal>;

//   const comment = commentOpt.unwrap() as Comment;

//   const { edit_history } = comment;

//   const renderCommentHistory = () => {
//     const commentArrays = edit_history.map((x, index) => <CommentFromHistory history={x} key={index} />);
//     return commentArrays.reverse();
//   };

//   return (
//     <Modal
//       open={open}
//       centered={true}
//       style={{ marginTop: '3rem' }}
//     >
//       <Modal.Header>Edit History</Modal.Header>
//       <Modal.Content scrolling>
//         {edit_history ? renderCommentHistory() : 'No change history'}
//       </Modal.Content>
//       <Modal.Actions>
//         <Button content='Close' onClick={close} />
//       </Modal.Actions>
//     </Modal>
//   );
// };

// export const CommentHistoryModal = withMulti(
//   InnerCommentHistoryModal,
//   withCalls<CommentHistoryProps>(
//     socialQueryToProp('commentById', { paramName: 'id', propName: 'commentOpt' })
//   )
// );

// type PropsPostFromHistory = {
//   history: PostHistoryRecord,
//   current_data: {
//     ipfs_hash: string
//   }
// };

// const PostFromHistory = (props: PropsPostFromHistory) => {
//   const { history: { old_data, edited }, current_data } = props;
//   const { ipfs_hash } = old_data;
//   const [ content, setContent ] = useState({} as PostContent);
//   const [ IpfsCid, setIpfsCid ] = useState('');

//   useEffect(() => {
//     ipfs_hash.isNone ? setIpfsCid(current_data.ipfs_hash) : setIpfsCid(ipfs_hash.unwrap().toString());
//     const loadData = async () => {
//       const data = await getJsonFromIpfs<PostContent>(IpfsCid);
//       setContent(data);
//     };
//     loadData().catch(err => new Error(err));
//   }, [ IpfsCid ]);

//   return (<div className='DfModal'>
//     <h1 style={{ display: 'flex' }}>
//       <span style={{ marginRight: '.5rem' }}>{content.title}</span>
//     </h1>
//     <CreatedBy created={edited} dateLabel='Edited on' accountLabel='Edited by' />
//     <div className='DfModal'>
//       {content.image && <img src={content.image} className='DfPostImage' /* add onError handler */ />}
//       <DfMd source={content.body} />
//       {/* TODO render tags */}
//     </div>
//   </div>);
// };

// type PostHistoryProps = ModalController & {
//   id: PostId,
//   postOpt?: Option<Post>
// };

// const InnerPostHistoryModal = (props: PostHistoryProps) => {
//   const { open, close, postOpt } = props;

//   if (postOpt === undefined) return <Modal><Loading /></Modal>;
//   else if (postOpt.isNone) return <Modal><NoData description={<span>Post not found</span>} /></Modal>;

//   const post = postOpt.unwrap();
//   const { edit_history } = post;

//   const history = fillHistoryForPost<VecPostHistoryRecord>(edit_history);

//   const renderPostHistory = () => {
//     return history && history.map((x, index) => <PostFromHistory
//       history={x}
//       key={index}
//       current_data={{ ipfs_hash: post.ipfs_hash }}
//     />);
//   };

//   return (
//     <Modal
//       open={open}
//       centered={true}
//       style={{ marginTop: '3rem' }}
//     >
//       <Modal.Header>Edit History</Modal.Header>
//       <Modal.Content scrolling>
//         {history && renderPostHistory()}
//       </Modal.Content>
//       <Modal.Actions>
//         <Button content='Close' onClick={close} />
//       </Modal.Actions>
//     </Modal>
//   );
// };

// export const PostHistoryModal = withMulti(
//   InnerPostHistoryModal,
//   withCalls<PostHistoryProps>(
//     socialQueryToProp('postById', { paramName: 'id', propName: 'postOpt' })
//   )
// );

// type SpaceHistoryProps = ModalController & {
//   id: SpaceId,
//   spaceOpt?: Option<Space>
// };

// type PropsSpaceFromHistory = {
//   history: SpaceHistoryRecord,
//   current_data: {
//     ipfs_hash: string,
//     handle: string
//   }
// };

// const SpaceFromHistory = (props: PropsSpaceFromHistory) => {
//   const { history: { old_data, edited }, current_data } = props;
//   const { ipfs_hash, handle } = old_data;
//   const [ content, setContent ] = useState({} as SpaceContent);
//   const [ IpfsCid, setIpfsCid ] = useState('');
//   const [ _handle, setHandle ] = useState('');

//   useEffect(() => {
//     ipfs_hash.isNone ? setIpfsCid(current_data.ipfs_hash) : setIpfsCid(ipfs_hash.unwrap().toString());
//     handle.isNone ? setHandle(current_data.handle) : setHandle(handle.unwrap().toString());
//     const loadData = async () => {
//       const data = await getJsonFromIpfs<SpaceContent>(IpfsCid);
//       setContent(data);
//     };
//     loadData().catch(err => new Error(err));
//   }, [ IpfsCid, _handle ]);

//   return (<div className='DfModal'>
//     <div className='ui massive relaxed middle aligned list FullProfile'>
//       <div className={`item ProfileDetails MySpace`}>
//         {content.image
//           ? <DfBgImg className='ui avatar image DfAvatar' src={content.image} size={40} rounded/>
//           : <IdentityIcon className='image' value={edited.account} size={38} />
//         }
//         <div className='DfContent'>
//           <div className='header DfHistoryTitle'>
//             <Link href='#'><a className='handle'>{content.name}</a></Link>
//           </div>
//           <div className='DfDescription'>{`handle: ${_handle}`}</div>
//           <div className='DfDescription'>
//             <DfMd source={content.desc} />
//           </div>
//         </div>
//       </div>
//     </div>
//     <CreatedBy created={edited} dateLabel='Edited on' accountLabel='Edited by' />
//   </div>);
// };

// const InnerSpaceHistoryModal = (props: SpaceHistoryProps) => {
//   const { open, close, spaceOpt } = props;

//   if (spaceOpt === undefined) return <Modal><Loading /></Modal>;
//   else if (spaceOpt.isNone) return <Modal><NoData description={<span>Space not found</span>} /></Modal>;

//   const space = spaceOpt.unwrap();
//   const { edit_history } = space;

//   const history = fillHistory<VecSpaceHistoryRecord>(edit_history);

//   const renderSpaceHistory = () => {
//     return history && history.map((x, index) => <SpaceFromHistory
//       history={x}
//       key={index}
//       current_data={{ ipfs_hash: space.ipfs_hash, handle: space.handle.toString() }}
//     />);
//   };

//   return (
//     <Modal
//       open={open}
//       centered={true}
//       style={{ marginTop: '3rem' }}
//     >
//       <Modal.Header>Edit History</Modal.Header>
//       <Modal.Content scrolling>
//         {edit_history.length > 0 && renderSpaceHistory()}
//       </Modal.Content>
//       <Modal.Actions>
//         <Button content='Close' onClick={close} />
//       </Modal.Actions>
//     </Modal>
//   );
// };

// export const SpaceHistoryModal = withMulti(
//   InnerSpaceHistoryModal,
//   withCalls<SpaceHistoryProps>(
//     socialQueryToProp('spaceById', { paramName: 'id', propName: 'spaceOpt' })
//   )
// );

// type ProfileHistoryProps = ModalController & {
//   id: AccountId,
//   socialAccountOpt?: Option<SocialAccount>,
//   socailAccount?: SocialAccount,
//   profile?: Profile
//   ProfileContent: ProfileContent
// };

// type PropsProfileFromHistory = {
//   history: ProfileHistoryRecord,
//   current_data: {
//     ipfs_hash: string,
//     username: string
//   }
// };

// const ProfileFromHistory = (props: PropsProfileFromHistory) => {
//   const { history: { old_data, edited }, current_data } = props;
//   const { ipfs_hash, username } = old_data;
//   const [ content, setContent ] = useState({} as ProfileContent);
//   const [ IpfsCid, setIpfsCid ] = useState('');
//   const [ _username, setUsername ] = useState(''); // TODO inconsistent naming

//   useEffect(() => {
//     ipfs_hash.isNone ? setIpfsCid(current_data.ipfs_hash) : setIpfsCid(ipfs_hash.unwrap().toString());
//     username.isNone ? setUsername(current_data.username) : setUsername(username.unwrap().toString());
//     const loadData = async () => {
//       const data = await getJsonFromIpfs<ProfileContent>(IpfsCid);
//       setContent(data);
//     };
//     loadData().catch(err => new Error(err));
//   }, [ IpfsCid, _username ]);

//   return (<div className='DfModal'>
//     <div className='ui massive relaxed middle aligned list FullProfile'>
//       <div className={`item ProfileDetails MySpace`}>
//         {content.avatar
//           ? <DfBgImg className='ui avatar image DfAvatar' src={content.avatar} size={40} rounded/>
//           : <IdentityIcon className='image' value={edited.account} size={38} />
//         }
//         <div className='content'>
//           <div className='header DfHistoryTitle'>
//             <Link href='#'><a className='handle'>{content.name}</a></Link>
//           </div>
//           <div className='about' style={{ margin: '0.2rem' }}>{`username: ${_username}`}</div>
//           <div className='about' style={{ margin: '0.2rem' }}>
//             <DfMd source={content.about} />
//           </div>
//         </div>
//       </div>
//     </div>
//     <CreatedBy created={edited} dateLabel='Edited on' accountLabel='Edited by' />
//   </div>);
// };

// const InnerProfileHistoryModal = (props: ProfileHistoryProps) => {
//   const { open, close, profile } = props;

//   if (!profile) return <em>Profile not found</em>;

//   const { edit_history } = profile;

//   const history = fillHistory<VecProfileHistoryRecord>(edit_history);

//   const renderProfileHistory = () => {
//     return history && history.map((x, index) => <ProfileFromHistory
//       history={x}
//       key={index}
//       current_data={{ ipfs_hash: profile.ipfs_hash, username: profile.username.toString() }}
//     />);
//   };

//   return (
//     <Modal
//       open={open}
//       centered={true}
//       style={{ marginTop: '3rem' }}
//     >
//       <Modal.Header>Edit History</Modal.Header>
//       <Modal.Content scrolling>
//         {edit_history.length > 0 && renderProfileHistory()}
//       </Modal.Content>
//       <Modal.Actions>
//         <Button content='Close' onClick={close} />
//       </Modal.Actions>
//     </Modal>
//   );
// };

// export const ProfileHistoryModal = withMulti(
//   InnerProfileHistoryModal,
//   withCalls<ProfileHistoryProps>(
//     socialQueryToProp('socialAccountById',
//       { paramName: 'id', propName: 'socialAccountOpt' })
//   ),
//   withRequireProfile,
//   withSocialAccount
// );
