import React from 'react';
import '../utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { BlogId, Score, PostId, VecPostHistoryRecord, RegularPost, PostExtension, Change, OptionChange } from '../types';
import BN from 'bn.js';
import ViewPostPage, { ViewPostPageProps } from '../posts/ViewPost';
import { AccountId, BlockNumber, U16, Moment } from '@polkadot/types';
// import dynamic from 'next/dynamic';
// const ViewPostPage = dynamic(() => import('../posts/ViewPost'), { ssr: false });

export default {
  title: 'ViewPost',
  decorators: [ withStorybookContext ]
};

const props: ViewPostPageProps = {
  variant: 'full', // "full" | "preview" | "name only"
  withLink: true,
  withCreatedBy: true,
  withStats: true,
  withActions: true,
  withBlogName: false,
  postData: {
    post: {
      id: new PostId(2),
      blog_id: new BlogId(3),
      created: new Change({ account: new AccountId('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'), block: new BlockNumber(40934), time: new BN(1585734144) as unknown as Moment }),
      updated: new OptionChange({ account: new AccountId('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'), block: new BlockNumber(432486), time: new BN(1585734144) as unknown as Moment }),
      extension: new PostExtension({ RegularPost: new RegularPost() }),
      ipfs_hash: 'QmRXtfUjtnxNR9QfbC1sZJdQu4FmxcuS3dZJubwVThgusA',
      comments_count: new U16(0),
      upvotes_count: new U16(1),
      downvotes_count: new U16(0),
      shares_count: new U16(6),
      edit_history: new VecPostHistoryRecord([]),
      score: new Score('0')
    },
    initialContent: {
      title: '222test post rthrthrt fdfdfd',
      blocks: [
        { kind: 'link', hidden: false, cid: 'QmPirdaP7RkUeWpb9WY5xJiTG1WKQCo7gdVaP56TZNv8W9' },
        { kind: 'text', hidden: false, cid: 'QmZBdNoH3Nxq4XT5N93GG3A7nnQdrUdKiTzd83k2gRrXHv' },
        { kind: 'link', hidden: false, cid: 'QmdgD2ZySxBQAxby5WCiNZRt7uqcLi28jYo54qE1pCMVqH' },
        { kind: 'link', hidden: false, cid: 'QmWit7GaMoss8ZC9FtkNSFX8dfczkn4v3cxZTFgJHTWaJU' },
        { kind: 'image', hidden: false, cid: 'QmeEuayJ8BkEc8bM98hWs5FRj47CHAqv8kbAu6kxZiSgtL' },
        { kind: 'text', hidden: false, cid: 'QmULKZ8QctLhCvzy63pbeoPi9qR6DLbgzYJSPvc4v3ZbkP' },
        { kind: 'code', hidden: false, cid: 'QmXLKgP1djQP7VPucqbHvXefikmf9huS5ar8z1TTwpXz2B' },
        { kind: 'link', hidden: false, cid: 'QmfK5tfzgP77o6EWefqEhiZPuNYQRgL7toCM7wzfSUjH3d' },
        { kind: 'link', hidden: false, cid: 'Qmc1BDBTEv2RXfdCg8kzTFe79aSmuNkfdsDBwiDYUhoofZ' }
      ],
      image: 'https://i.ytimg.com/vi/rcMJeTv6P9M/maxresdefault.jpg',
      tags: [ 'qweqwe', 'asd', 'zxc', 'fdsf' ],
      canonical: 'http://canonical.com',
      blockValues: [
        { id: 0, kind: 'link', hidden: false, data: 'https://gist.github.com/sagaidak/05b068604606ea907032b8261b079986', useOnPreview: false },
        { id: 1, kind: 'text', hidden: false, data: '# Some text↵list:↵1. qwe↵2. asd↵3. zxc↵↵* qwe↵* asd↵* zxc↵↵**bold text**↵↵> quote', useOnPreview: false },
        { id: 2, kind: 'link', hidden: false, data: 'https://cointelegraph.com/news/q3-crypto-ponzi-victims-file-class-action-lawsuit-against-wells-fargo', useOnPreview: false },
        { id: 3, kind: 'link', hidden: false, data: 'https://twitter.com/Consensys/status/1245373626750251014', useOnPreview: false },
        { id: 4, kind: 'image', hidden: false, data: 'https://worldcatcomedy.com/wp-content/uploads/2019/01/maxresdefault-63.jpg', useOnPreview: false },
        { id: 5, kind: 'text', hidden: false, data: 'Qwe qweqwe qwe, qweqwe.', useOnPreview: false},
        { id: 6, kind: 'code', hidden: false, data: 'useEffect(() => {↵    for (const x of blockValues)…, x.data)↵    }↵  }, [])↵  ↵  // davai rabotai!! ', lang: 'typescript', useOnPreview: true },
        { id: 7, kind: 'link', hidden: false, data: 'https://www.youtube.com/watch?v=0q66VFE5vW4', useOnPreview: false},
        { id: 8, kind: 'link', hidden: false, data: 'https://vimeo.com/402243207', useOnPreview: true }
      ],
      summary: 'Some text↵list:↵qwe↵asd↵zxc↵↵qwe↵asd↵zxc↵↵bold text↵quote↵↵'
    }
  },
  // postExtData:
  statusCode: 200
}

export const ViewPost = () =>
  <ViewPostPage {...props} />
