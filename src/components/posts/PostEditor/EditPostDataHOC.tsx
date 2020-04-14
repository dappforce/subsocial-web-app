import React, { useState, useEffect } from 'react';
import { useMyAccount } from '../../utils/MyAccountContext';
import { useRouter } from 'next/router';
import { Loading } from '../../utils/utils';
import { PostBlock, BlockValueKind } from '../../types';
import { ValidationProps } from './EditPostValidations'
import { Post, BlogId } from '@subsocial/types/substrate/interfaces';
import { PostContent } from '@subsocial/types/offchain';
import BN from 'bn.js';
import { Option, Enum } from '@polkadot/types/codec';
import { useSubsocialApi } from '../../utils/SubsocialApiContext'
import { newLogger } from '@subsocial/utils'

const log = newLogger('EditPostDataHOC')

export type OuterProps = ValidationProps & {
  blogId?: BN,
  id?: BN,
  extension?: Enum,
  struct?: Post
  json?: PostContent,
  mappedBlocks?: BlockValueKind[],
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
      return <Component id={new BN(postId as string)} {...props}/>;
    } catch (err) {
      return <em>Invalid post ID: {postId}</em>;
    }
  };
}

export function withBlogIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function () {
    const router = useRouter();
    const { blogId } = router.query;
    try {
      return <Component blogId={new BN(blogId as string)} />;
    } catch (err) {
      return <em>Invalid blog ID: {blogId}</em>;
    }
  };
}

type LoadStructProps = OuterProps & {
  structOpt: Option<Post>
};

export function LoadStruct (Component: React.ComponentType<LoadStructProps>) {
  return function (props: LoadStructProps) {
    const { state: { address: myAddress } } = useMyAccount();
    const { ipfs } = useSubsocialApi()
    const { structOpt } = props;
    const [ json, setJson ] = useState<PostContent>();
    const [ struct, setStruct ] = useState<Post>();
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

      ipfs.findPost(struct.ipfs_hash).then(json => {
        if (json && json.blocks && json.blocks.length > 0) {
          const processArray = async (arr: PostBlock[]) => {
            const temp: BlockValueKind[] = []
            for (const item of arr) {
              const res = await ipfs.findPost(item.cid)
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
      }).catch(err => log.error('Failed to find a post in IPFS:', err));

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