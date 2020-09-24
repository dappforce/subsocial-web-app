import { SpaceContent } from '@subsocial/types/offchain';
import { nonEmptyStr } from '@subsocial/utils';
import mdToText from 'markdown-to-txt';
import { NextPage } from 'next';
import Error from 'next/error';
import React, { useState } from 'react';

import { AuthorPreview } from '../profiles/address-views';
import { DfMd } from '../utils/DfMd';
import { HeadMeta } from '../utils/HeadMeta';
import { return404 } from '../utils/next';
import Section from '../utils/Section';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { formatUnixDate } from '../utils';
import ViewTags from '../utils/ViewTags';
import SpaceStatsRow from './SpaceStatsRow';
import { ViewSpaceProps } from './ViewSpaceProps';
import withLoadSpaceDataById from './withLoadSpaceDataById';
import { PageContent } from '../main/PageWrapper';
import { getSpaceId } from '../substrate';
import { SpaceNotFound } from './helpers';

type Props = ViewSpaceProps

export const AboutSpacePage: NextPage<Props> = (props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { spaceData } = props;

  if (!spaceData || !spaceData?.struct) {
    return <SpaceNotFound />
  }

  const { owner } = props;
  const space = spaceData.struct;
  const { created: { time }, owner: spaceOwnerAddress } = space;

  const [ content ] = useState(spaceData?.content || {} as SpaceContent);
  const { name, about, image, tags } = content;

  const SpaceAuthor = () =>
    <AuthorPreview
      address={spaceOwnerAddress}
      owner={owner}
      withFollowButton
      isShort={true}
      isPadded={false}
      details={<div>Created on {formatUnixDate(time)}</div>}
    />

  const title = `About ${name}`

  // TODO extract WithSpaceNav

  return <PageContent>
    <HeadMeta title={title} desc={mdToText(about)} image={image} />
    <Section className='DfContentPage' level={1} title={title}>

      <div className='DfRow mt-3'>
        <SpaceAuthor />
        <SpaceStatsRow space={space} />
      </div>

      {nonEmptyStr(about) &&
        <div className='DfBookPage'>
          <DfMd source={about} />
        </div>
      }
      <ViewTags tags={tags} />
    </Section>
  </PageContent>
}

// TODO extract getInitialProps, this func is similar in ViewSpace

AboutSpacePage.getInitialProps = async (props): Promise<Props> => {
  const { query: { spaceId } } = props
  const idOrHandle = spaceId as string

  const id = await getSpaceId(idOrHandle)
  if (!id) {
    return return404(props)
  }

  const subsocial = await getSubsocialApi()
  const spaceData = id && await subsocial.findSpace({ id })
  if (!spaceData?.struct) {
    return return404(props)
  }

  const ownerId = spaceData?.struct.owner
  const owner = await subsocial.findProfile(ownerId)

  return {
    spaceData,
    owner
  }
}

export default AboutSpacePage

export const AboutSpace = withLoadSpaceDataById(AboutSpacePage)
