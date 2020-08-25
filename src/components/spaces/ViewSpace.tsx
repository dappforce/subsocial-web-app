import IdentityIcon from 'src/components/utils/IdentityIcon';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { SpaceContent } from '@subsocial/types/offchain';
import { nonEmptyStr } from '@subsocial/utils';
import BN from 'bn.js';
import mdToText from 'markdown-to-txt';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Error from 'next/error';
import React from 'react';
import { Segment } from 'src/components/utils/Segment';

import { isHidden } from '../utils';
import { DfBgImg } from '../utils/DfBgImg';
import { HeadMeta } from '../utils/HeadMeta';
import { SummarizeMd } from '../utils/md';
import { isMyAddress } from '../auth/MyAccountContext';
import MyEntityLabel from '../utils/MyEntityLabel';
import { return404 } from '../utils/next';
import Section from '../utils/Section';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { getSpaceId } from '../substrate';
import ViewTags from '../utils/ViewTags';
import SpaceStatsRow from './SpaceStatsRow';
import { ViewSpaceProps } from './ViewSpaceProps';
import withLoadSpaceDataById from './withLoadSpaceDataById';
import AboutSpaceLink from './AboutSpaceLink';
import ViewSpaceLink from './ViewSpaceLink';
import { PageContent } from '../main/PageWrapper';
import { DropdownMenu, PostPreviewsOnSpace, SpaceNotFound, HiddenSpaceAlert } from './helpers';
import { ContactInfo } from './SocialLinks/ViewSocialLinks';

// import { SpaceHistoryModal } from '../utils/ListsEditHistory';
const FollowSpaceButton = dynamic(() => import('../utils/FollowSpaceButton'), { ssr: false });

// TODO get rid of this 'hack'
const SUB_SIZE = 2;

type Props = ViewSpaceProps

export const ViewSpacePage: NextPage<Props> = (props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { spaceData } = props;

  if (!spaceData || !spaceData?.struct || isHidden({ struct: spaceData.struct })) {
    return <SpaceNotFound />
  }

  const {
    preview = false,
    nameOnly = false,
    withLink = false,
    miniPreview = false,
    withFollowButton = true,
    dropdownPreview = false,
    postIds = [],
    posts = [],
    imageSize = 64,
    onClick
  } = props;

  const space = spaceData.struct;

  const {
    id,
    created: { account }
  } = space;

  const { about, name, image, tags, ...contactInfo } = spaceData?.content || {} as SpaceContent

  const isMySpace = isMyAddress(account);
  const hasImage = nonEmptyStr(image);

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
        <div className='content w-100'>
          <span className='mb-3'>
            <div className='d-flex justify-content-between'>
              <span className='header'>
                <SpaceNameAsLink />
                <MyEntityLabel isMy={isMySpace}>My space</MyEntityLabel>
              </span>
              <span>
                <DropdownMenu className='m-3' spaceData={spaceData} />
                {withFollowButton && <FollowSpaceButton spaceId={id} />}
              </span>
            </div>

          </span>

          {nonEmptyStr(about) &&
            <div className='description'>
              <SummarizeMd md={about} more={
                <AboutSpaceLink space={space} title={'Learn More'} />
              } />
            </div>
          }

          <ViewTags tags={tags} />

          <span className='d-flex justify-content-between'>
            <SpaceStatsRow space={space} />
            <ContactInfo {...contactInfo} />
          </span>
        </div>
      </div>
    </div>

  if (nameOnly) {
    return renderNameOnly();
  } else if (dropdownPreview) {
    return renderDropDownPreview();
  } else if (miniPreview) {
    return renderMiniPreview();
  } else if (preview) {
    return <Segment>
      <HiddenSpaceAlert space={space} preview />
      {renderPreview()}
    </Segment>;
  }

  return <>
    <HiddenSpaceAlert space={space} />
    <div className='ViewSpaceWrapper'>
      <HeadMeta title={name} desc={mdToText(about)} image={image} />
      <PageContent>
        <Segment>{renderPreview()}</Segment>
        <Section className='DfContentPage mt-3'>
          <PostPreviewsOnSpace spaceData={spaceData} posts={posts} postIds={postIds} />
        </Section>
      </PageContent>
    </div></>
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

  const spaceData = id && await subsocial.findSpace({ id: id })
  if (!spaceData?.struct) {
    return return404(props)
  }

  const ownerId = spaceData?.struct.owner as AccountId
  const owner = await subsocial.findProfile(ownerId)

  const postIds = await substrate.postIdsBySpaceId(id as BN)
  const posts = await subsocial.findVisiblePostsWithAllDetails(postIds.reverse())

  return {
    spaceData,
    posts,
    postIds,
    owner
  }
}

export default ViewSpacePage

export const ViewSpace = withLoadSpaceDataById(ViewSpacePage)
