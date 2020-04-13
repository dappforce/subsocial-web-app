import React, { useState, useEffect } from 'react';
import { useMyAccount } from '../../utils/MyAccountContext';
import { getJsonFromIpfs } from '../../utils/OffchainUtils';
import { useRouter } from 'next/router';
import { Loading } from '../../utils/utils';
import { PostBlock, BlockValueKind, PostContent, Post, BlogId, PostId, PostExtension } from '../../types';
import { Option } from '@polkadot/types/codec';

type ValidationProps = {};

type OuterProps = ValidationProps & {
  blogId?: BlogId,
  id?: PostId,
  extention?: PostExtension,
  struct?: Post
  json?: PostContent,
  mappedBlocks?: BlockValueKind[]
  onlyTxButton?: boolean,
  closeModal?: () => void,
  withButtons?: boolean,
  myAddress?: string,
  blogIds?: BlogId[],
  tagsData?: string[]
};


export function withIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function (props: OuterProps) {
    const router = useRouter();
    const { postId } = router.query;
    const { id } = props;

    if (id) return <Component { ...props } />;

    try {
      return <Component id={new PostId(postId as string)} {...props}/>;
    } catch (err) {
      return <em>Invalid post ID: {postId}</em>;
    }
  };
}

export function withBlogIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function (props: OuterProps) {
    const router = useRouter();
    const { blogId } = router.query;
    try {
      return <Component blogId={new BlogId(blogId as string)} { ...props } />;
    } catch (err) {
      return <em>Invalid blog ID: {blogId}</em>;
    }
  };
}

type LoadStructProps = OuterProps & {
  structOpt: Option<Post>
};

type StructJson = PostContent | undefined;
type Struct = Post | undefined;

export function LoadStruct (Component: React.ComponentType<LoadStructProps>) {
  return function (props: LoadStructProps) {
    const { state: { address: myAddress } } = useMyAccount();
    const { structOpt } = props;
    const [ json, setJson ] = useState(undefined as StructJson);
    const [ struct, setStruct ] = useState(undefined as Struct);
    const [ trigger, setTrigger ] = useState(false);
    const [ mappedBlocks, setMappedBlocks ] = useState(undefined as unknown as BlockValueKind[])
    const jsonIsNone = json === undefined;

    const toggleTrigger = () => {
      json === undefined && setTrigger(!trigger);
    };

    useEffect(() => {
      if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();

      setStruct(structOpt.unwrap());

      if (struct === undefined) return toggleTrigger();

      console.log('Loading post JSON from IPFS');

      getJsonFromIpfs<PostContent>(struct.ipfs_hash).then(json => {

        if (json.blocks && json.blocks.length > 0) {

          const processArray = async (arr: PostBlock[]) => {
            const temp: BlockValueKind[] = []
            for (const item of arr) {
              const res = await getJsonFromIpfs<BlockValueKind>(item.cid)
              temp.push(res)
            }
            return temp
          }

          processArray(json.blocks as PostBlock[]).then((tempBlocks) => {
            setMappedBlocks(tempBlocks)
          })

          if (mappedBlocks === undefined) return toggleTrigger();

        }
        setJson(json);
      }).catch(err => console.log(err));
    }, [ trigger ]);

    if (!myAddress || !structOpt || jsonIsNone || !mappedBlocks) {
      return <Loading />;
    }

    if (structOpt.isNone) {
      return <em>Post not found</em>;
    }

    if (!struct || !struct.created.account.eq(myAddress)) {
      return <em>You have no rights to edit this post</em>;
    }

    return <Component {...props} struct={struct} json={json} mappedBlocks={mappedBlocks} myAddress={myAddress} />;
  };
}