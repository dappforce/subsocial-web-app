import { GenericAccountId as AccountId } from '@polkadot/types';
import { SpaceContent } from '@subsocial/types/offchain';
import { nonEmptyStr, isEmptyStr } from '@subsocial/utils';
import BN from 'bn.js';
import { mdToText } from 'src/utils';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Error from 'next/error';
import React, { useCallback } from 'react';
import { Segment } from 'src/components/utils/Segment';
import { isHidden, resolveBn } from '../utils';
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
import { getPageOfIds } from '../utils/getIds';
import { editSpaceUrl, spaceUrl } from '../urls';
import ButtonLink from '../utils/ButtonLink';
import { EditOutlined } from '@ant-design/icons';
import { EntityStatusGroup, PendingSpaceOwnershipPanel } from '../utils/EntityStatusPanels';
import { fullPath } from '../urls/helpers';

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

  const title = React.createElement(
    preview ? 'span' : 'h1',
    { className: 'header'},
    <>
      <SpaceNameAsLink className='mr-3' />
      <MyEntityLabel isMy={isMy}>My space</MyEntityLabel>
    </>
  );

  const renderPreview = () =>
    <div className={primaryClass}>
      <div className='DfSpaceBody'>
        <Avatar />
        <div className='ml-2 w-100'>
          <div className='d-flex justify-content-between'>
            {title}
            <span className='d-flex align-items-center'>
              <DropdownMenu className='mx-2' spaceData={spaceData} />
              {isMy &&
                <ButtonLink href={`/[spaceId]/edit`} as={editSpaceUrl(space)} className='mr-2 bg-transparent'>
                  <EditOutlined /> Edit
                </ButtonLink>
              }
              {withFollowButton &&
                <FollowSpaceButton spaceId={id} />
              }
            </span>
          </div>

          {nonEmptyStr(about) &&
            <div className='description mt-3'>
              <SummarizeMd md={about} more={
                <AboutSpaceLink space={space} title={'Learn More'} />
              } />
            </div>
          }

          {withTags && <ViewTags tags={tags} className='mt-2' />}

          {withStats && <span className='d-flex justify-content-between flex-wrap mt-3'>
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
      <EntityStatusGroup>
        <PendingSpaceOwnershipPanel space={space} preview />
        <HiddenSpaceAlert space={space} preview />
      </EntityStatusGroup>
      {renderPreview()}
    </Segment>;
  }

  return <>
    <PageContent>
      <PendingSpaceOwnershipPanel space={space} />
      <HiddenSpaceAlert space={space} />
      <Section>{renderPreview()}</Section>
      <Section className='DfContentPage mt-4'>
        <PostPreviewsOnSpace spaceData={spaceData} posts={posts} postIds={postIds} />
      </Section>
    </PageContent>
  </>
}

// TODO extract getInitialProps, this func is similar in AboutSpace

const ViewSpacePage: NextPage<Props> = (props) => {
  const { spaceData } = props

  if (!spaceData || !spaceData.content) {
    return null
  }

  const id = resolveBn(spaceData.struct.id)
  const { about, name, image } = spaceData.content

  // Simple check (should be imroved later)
  const isPolkaProject = id.eqn(1) || (id.gtn(1000) && id.ltn(1218))

  // Need to add this to a title to improve SEO of Polkadot projects.
  const title = name + (isPolkaProject ? ' - Polkadot ecosystem projects' : '')

  return <>
    <HeadMeta title={title} desc={mdToText(about)} image={image} canonical={fullPath(spaceUrl(spaceData.struct))} />
    <ViewSpace {...props} />
  </>
}

ViewSpacePage.getInitialProps = async (props): Promise<Props> => {
  const { query, res } = props
  const { spaceId } = query
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

  const handle = `@${spaceData.struct.handle.unwrapOr(undefined)}`

  if (handle !== idOrHandle && res) {
    res.writeHead(301, { Location: spaceUrl(spaceData.struct) })
    res.end()
  }

  const ownerId = spaceData?.struct.owner as AccountId
  const owner = await subsocial.findProfile(ownerId)

  // We need to reverse post ids to display posts in a descending order on a space page.
  const postIds = (await substrate.postIdsBySpaceId(id as BN)).reverse()
  const pageIds = getPageOfIds(postIds, query)
  const posts = await subsocial.findPublicPostsWithAllDetails(pageIds)

  return {
    spaceData,
    posts,
    postIds,
    owner
  }
}

export default ViewSpacePage

export const DynamicViewSpace = withLoadSpaceDataById(ViewSpace)
