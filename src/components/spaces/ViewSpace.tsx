import { GenericAccountId as AccountId } from '@polkadot/types';
import { SpaceContent } from '@subsocial/types/offchain';
import { nonEmptyStr, isEmptyStr } from '@subsocial/utils';
import BN from 'bn.js';
import mdToText from 'markdown-to-txt';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Error from 'next/error';
import React, { useCallback } from 'react';
import { Segment } from 'src/components/utils/Segment';

import { isHidden } from '../utils';
import { HeadMeta } from '../utils/HeadMeta';
import { SummarizeMd } from '../utils/md';
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
import { DropdownMenu, PostPreviewsOnSpace, SpaceNotFound, HiddenSpaceAlert, SpaceAvatar, isMySpace } from './helpers';
import { ContactInfo } from './SocialLinks/ViewSocialLinks';
import { MutedSpan } from '../utils/MutedText';
import { BareProps } from '../utils/types';

// import { SpaceHistoryModal } from '../utils/ListsEditHistory';
const FollowSpaceButton = dynamic(() => import('../utils/FollowSpaceButton'), { ssr: false });

type Props = ViewSpaceProps

export const ViewSpace = (props: Props) => {
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
    withStats = true,
    withTags = true,
    dropdownPreview = false,
    postIds = [],
    posts = [],
    onClick,
    imageSize = 64
  } = props;

  const space = spaceData.struct;

  const {
    id,
    owner
  } = space;

  const { about, name, image, tags, ...contactInfo } = spaceData?.content || {} as SpaceContent

  const spaceName = isEmptyStr(name) ? <MutedSpan>{'<Unnamed Space>'}</MutedSpan> : name

  const Avatar = useCallback(() => <SpaceAvatar space={space} address={owner} avatar={image} size={imageSize} />, [])

  const isMy = isMySpace(space)

  const primaryClass = `ProfileDetails ${isMy && 'MySpace'}`

  const SpaceNameAsLink = (props: BareProps) =>
    <ViewSpaceLink space={space} title={spaceName} {...props} />

  const renderNameOnly = () =>
    withLink
      ? <SpaceNameAsLink />
      : <span>{spaceName}</span>

  const renderDropDownPreview = () =>
    <div className={`${primaryClass} DfPreview`}>
      <Avatar />
      <div className='content'>
        <div className='handle'>{spaceName}</div>
      </div>
    </div>

  const renderMiniPreview = () =>
    <div className={'viewspace-minipreview'}>
      <div onClick={onClick} className={primaryClass}>
        <Avatar />
        <div className='content'>
          <div className='handle'>{spaceName}</div>
        </div>
      </div>
      {withFollowButton && <FollowSpaceButton spaceId={id} />}
    </div>

  const renderPreview = () =>
    <div className={primaryClass}>
      <div className='DfSpaceBody'>
        <Avatar />
        <div className='ml-2 w-100'>
          <span className='mb-3'>
            <div className='d-flex justify-content-between mb-3'>
              <span className='header'>
                <SpaceNameAsLink className='mr-3' />
                <MyEntityLabel isMy={isMy}>My space</MyEntityLabel>
              </span>
              <span className='d-flex align-items-center'>
                <DropdownMenu className='mx-3' spaceData={spaceData} />
                {withFollowButton && <FollowSpaceButton spaceId={id} />}
              </span>
            </div>
          </span>

          {nonEmptyStr(about) &&
            <div className='description mb-2'>
              <SummarizeMd md={about} more={
                <AboutSpaceLink space={space} title={'Learn More'} />
              } />
            </div>
          }

          {withTags && <ViewTags tags={tags} />}

          {withStats && <span className='d-flex justify-content-between flex-wrap'>
            <SpaceStatsRow space={space} />
            {!preview && <ContactInfo {...contactInfo} />}
          </span>}
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
      <PageContent>
        <Section>{renderPreview()}</Section>
        <Section className='DfContentPage mt-3'>
          <PostPreviewsOnSpace spaceData={spaceData} posts={posts} postIds={postIds} />
        </Section>
      </PageContent>
    </div></>
}

// TODO extract getInitialProps, this func is similar in AboutSpace

const ViewSpacePage: NextPage<Props> = (props) => {
  const { about, name, image } = props.spaceData?.content || {} as SpaceContent

  return <>
    <HeadMeta title={name} desc={mdToText(about, { escapeHtml: true })} image={image} />
    <ViewSpace {...props} />
  </>
}

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
  const posts = await subsocial.findPublicPostsWithAllDetails(postIds.reverse())

  return {
    spaceData,
    posts,
    postIds,
    owner
  }
}

export default ViewSpacePage

export const DynamicViewSpace = withLoadSpaceDataById(ViewSpace)
