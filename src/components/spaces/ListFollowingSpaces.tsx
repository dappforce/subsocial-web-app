import { SpaceData } from '@subsocial/types/dto';
import { isEmptyArray, nonEmptyArr } from '@subsocial/utils';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import DataList from '../utils/DataList';
import { HeadMeta } from '../utils/HeadMeta';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { spaceIdForUrl, spaceUrl } from '../urls';
import { ViewSpacePage } from './ViewSpace';
import ButtonLink from '../utils/ButtonLink';

type Props = {
  spacesData: SpaceData[]
};

export const ListFollowingSpacesPage: NextPage<Props> = (props) => {
  const { spacesData } = props;
  const totalCount = nonEmptyArr(spacesData) ? spacesData.length : 0;
  const title = `My Subscriptions (${totalCount})`

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta title={title} desc='The spaces you follow on Subsocial' />
      <DataList
        title={title}
        dataSource={spacesData}
        renderItem={(item, index) => (
          <ViewSpacePage {...props} key={index} spaceData={item} withFollowButton/>
        )}
        noDataDesc='You are not subscribed to any space yet'
        noDataExt={<ButtonLink href='/spaces/all' as='/spaces/all'>Explore spaces</ButtonLink>}
      />
    </div>
  );
};

ListFollowingSpacesPage.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;

  // TODO sort space ids in a about order (don't forget to sort by id.toString())
  const followedSpaceIds = await substrate.spaceIdsFollowedByAccount(address as string)
  const spacesData = await subsocial.findPublicSpaces(followedSpaceIds);

  return {
    spacesData
  };
};

// TODO extract to a separate file:

const SpaceLink = (props: { item: SpaceData }) => {
  const { item } = props;
  const { pathname, query } = useRouter();
  const { toggle, state: { asDrawer } } = useSidebarCollapsed();

  if (!item) return null;

  const idForUrl = spaceIdForUrl(item.struct)
  const isSelectedSpace = pathname.includes('spaces') &&
    query.spaceId as string === idForUrl

  return (
    <Link
      key={idForUrl}
      href='/spaces/[spaceId]'
      as={spaceUrl(item.struct)}
    >
      <a className={`DfMenuSpaceLink ${isSelectedSpace ? 'DfSelectedSpace' : ''}`}>
        <ViewSpacePage
          key={idForUrl}
          spaceData={item}
          miniPreview
          imageSize={28}
          onClick={() => asDrawer && toggle()}
          withFollowButton={false}
        />
      </a>
    </Link>
  )
}

export const RenderFollowedList = (props: { followedSpacesData: SpaceData[] }) => {
  const { followedSpacesData } = props;
  const { state: { collapsed } } = useSidebarCollapsed()

  if (isEmptyArray(followedSpacesData)) {
    return collapsed ? null : (
      <div className='text-center m-2'>
        <ButtonLink href='/spaces/all' as='/spaces/all'>Explore Spaces</ButtonLink>
      </div>
    )
  }

  return <>{followedSpacesData.map((item) =>
    <SpaceLink key={item.struct.id.toString()} item={item} />
  )}</>
}

export default RenderFollowedList;
