import IdentityIcon from '@subsocial/react-components/IdentityIcon';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { SpaceContent } from '@subsocial/types/offchain';
import { nonEmptyStr } from '@subsocial/utils';
import { Button, Dropdown, Icon, Menu } from 'antd';
import BN from 'bn.js';
import mdToText from 'markdown-to-txt';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Error from 'next/error';
import Link from 'next/link';
import React, { useState } from 'react';
import { isBrowser } from 'react-device-detect';
import { Segment } from 'semantic-ui-react';

import { ZERO } from '../utils';
import ListData from '../utils/DataList';
import { DfBgImg } from '../utils/DfBgImg';
import NoData from '../utils/EmptyList';
import { HeadMeta } from '../utils/HeadMeta';
import { SummarizeMd } from '../utils/md';
import { isMyAddress } from '../utils/MyAccountContext';
import MyEntityLabel from '../utils/MyEntityLabel';
import { return404 } from '../utils/next';
import { Pluralize } from '../utils/Plularize';
import Section from '../utils/Section';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { editSpaceUrl } from '../utils/urls';
import { getSpaceId } from '../utils/substrate';
import ViewTags from '../utils/ViewTags';
import SpaceStatsRow from './SpaceStatsRow';
import SpaceNav from './SpaceNav';
import { ViewSpaceProps } from './ViewSpaceProps';
import withLoadSpaceDataById from './withLoadSpaceDataById';
import AboutSpaceLink from './AboutSpaceLink';
import ViewSpaceLink from './ViewSpaceLink';
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config';
import PostPreview from '../posts/view-post/PostPreview';
import { PageContent } from '../main/PageWrapper';

// import { SpaceHistoryModal } from '../utils/ListsEditHistory';
const FollowSpaceButton = dynamic(() => import('../utils/FollowSpaceButton'), { ssr: false });

// TODO get rid of this 'hack'
const SUB_SIZE = 2;

type Props = ViewSpaceProps

export const ViewSpacePage: NextPage<Props> = (props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { spaceData } = props;

  if (!spaceData || !spaceData?.struct) {
    return <NoData description={<span>Space not found</span>} />
  }

  const {
    preview = false,
    nameOnly = false,
    withLink = false,
    miniPreview = false,
    previewDetails = false,
    withFollowButton = false,
    dropdownPreview = false,
    posts = [],
    imageSize = DEFAULT_AVATAR_SIZE,
    onClick
  } = props;

  const space = spaceData.struct;

  const {
    id,
    created: { account },
    posts_count
  } = space;

  const [ content ] = useState(spaceData?.content || {} as SpaceContent);
  const { desc, name, image, tags } = content;

  const isMySpace = isMyAddress(account);
  const hasImage = nonEmptyStr(image);
  const postsCount = new BN(posts_count).eq(ZERO) ? 0 : new BN(posts_count);

  const renderDropDownMenu = () => {
    const menu =
      <Menu>
        {isMySpace && <Menu.Item key='0'>
          <Link href={`/spaces/[id]/edit`} as={editSpaceUrl(space)}>
            <a className='item'>Edit</a>
          </Link>
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>

    return <>
      {isMySpace &&
        <Dropdown overlay={menu} placement='bottomRight'>
          <Icon type='ellipsis' />
        </Dropdown>
      }
      {/* open && <SpaceHistoryModal id={id} open={open} close={close} /> */}
    </>
  };

  const SpaceNameAsLink = () =>
    <ViewSpaceLink space={space} title={name} />

  const renderNameOnly = () =>
    withLink
      ? <SpaceNameAsLink />
      : <span>{name}</span>

  const renderDropDownPreview = () =>
    <div className={`ProfileDetails DfPreview ${isMySpace && 'MySpace'}`}>
      {hasImage
        ? <DfBgImg className='DfAvatar' size={imageSize} src={image} style={{ border: '1px solid #ddd' }} rounded/>
        : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
      }
      <div className='content'>
        <div className='handle'>{name}</div>
      </div>
    </div>

  const renderMiniPreview = () =>
    <div className={'viewspace-minipreview'}>
      <div onClick={onClick} className={`ProfileDetails ${isMySpace && 'MySpace'}`}>
        {hasImage
          ? <DfBgImg className='DfAvatar space' size={imageSize} src={image} style={{ border: '1px solid #ddd' }} rounded/>
          : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
        }
        <div className='content'>
          <div className='handle'>{name}</div>
        </div>
      </div>
      {withFollowButton && <FollowSpaceButton spaceId={id} />}
    </div>

  const renderPreview = () =>
    <div className={`ProfileDetails ${isMySpace && 'MySpace'}`}>
      <div className='DfSpaceBody'>
        {hasImage
          ? <DfBgImg className='DfAvatar space' size={imageSize} src={image} rounded/>
          : <IdentityIcon className='image' value={account} size={imageSize - SUB_SIZE} />
        }
        <div className='content'>
          <span className='header DfSpaceTitle'>
            <SpaceNameAsLink />
            <MyEntityLabel isMy={isMySpace}>My space</MyEntityLabel>
            {!previewDetails && renderDropDownMenu()}
          </span>

          {nonEmptyStr(desc) &&
            <div className='description'>
              <SummarizeMd md={desc} more={
                <AboutSpaceLink space={space} title={'Learn More'} />
              } />
            </div>
          }

          <ViewTags tags={tags} />
          {previewDetails && <SpaceStatsRow space={space} />}
        </div>
      </div>
      {withFollowButton && <FollowSpaceButton spaceId={id} />}
    </div>

  if (nameOnly) {
    return renderNameOnly();
  } else if (dropdownPreview) {
    return renderDropDownPreview();
  } else if (miniPreview) {
    return renderMiniPreview();
  } else if (preview || previewDetails) {
    return <Segment>{renderPreview()}</Segment>;
  }

  const renderPostPreviews = () =>
    <ListData
      title={postsSectionTitle()}
      dataSource={posts}
      noDataDesc='No posts yet'
      noDataExt={isMySpace
        // TODO replace with Next Link + URL builder
        ? <Button type='primary' ghost href={`/spaces/${id}/posts/new`}>Create post</Button>
        : null
      }
      renderItem={(item) =>
        <PostPreview
          key={item.post.struct.id.toString()}
          postStruct={item}
        />
      }
    />

  const NewPostButton = () => isMySpace
    // TODO replace with Next Link + URL builder
    ? <Button href={`/spaces/${id}/posts/new`} icon='plus' size='small' className='DfGreyButton'>New post</Button>
    : null

  const postsSectionTitle = () =>
    <div className='DfSection--withButton'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={postsCount} singularText='Post'/>
      </span>
      {posts.length > 0 && <NewPostButton />}
    </div>

  // TODO extract WithSpaceNav

  return <div className='ViewSpaceWrapper'>
    <HeadMeta title={name} desc={mdToText(desc)} image={image} />
    <PageContent withOnBoarding leftPanel={isBrowser &&
      <SpaceNav
        {...content}
        spaceId={new BN(id)}
        creator={account}
      />
    }>
      <Section className='DfContentPage'>
        {renderPostPreviews()}
      </Section>
    </PageContent>

  </div>
}

// TODO extract getInitialProps, this func is similar in AboutSpace

ViewSpacePage.getInitialProps = async (props): Promise<Props> => {
  const { query: { spaceId } } = props
  const idOrHandle = spaceId as string

  const id = await getSpaceId(idOrHandle)
  if (!id) {
    return return404(props)
  }

  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial

  const spaceData = id && await subsocial.findSpace(id)
  if (!spaceData?.struct) {
    return return404(props)
  }

  const ownerId = spaceData?.struct.owner as AccountId
  const owner = await subsocial.findProfile(ownerId)

  const postIds = await substrate.postIdsBySpaceId(id as BN)
  const posts = await subsocial.findPostsWithAllDetails(postIds.reverse())

  return {
    spaceData,
    posts,
    owner
  }
}

export default ViewSpacePage

export const ViewSpace = withLoadSpaceDataById(ViewSpacePage)
