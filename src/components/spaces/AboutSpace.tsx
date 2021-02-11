import { SpaceContent } from '@subsocial/types/offchain'
import { isEmptyArray, isEmptyStr, nonEmptyStr } from '@subsocial/utils'
import { mdToText } from 'src/utils'
import { NextPage } from 'next'
import Error from 'next/error'
import React, { useCallback, useState } from 'react'

import { ProfilePreview } from '../profiles/address-views'
import { DfMd } from '../utils/DfMd'
import { return404 } from '../utils/next'
import Section from '../utils/Section'
import { getSubsocialApi } from '../utils/SubsocialConnect'
import ViewTags from '../utils/ViewTags'
import { ViewSpaceProps } from './ViewSpaceProps'
import withLoadSpaceDataById from './withLoadSpaceDataById'
import { PageContent } from '../main/PageWrapper'
import { getSpaceId } from '../substrate'
import { isUnlistedSpace, SpaceNotFound } from './helpers'
import { InfoPanel } from '../profiles/address-views/InfoSection'
import { EmailLink, SocialLink } from './SocialLinks/ViewSocialLinks'
import Segment from '../utils/Segment'
import { appName } from '../utils/env'
import { ViewSpace } from './ViewSpace'
import { aboutSpaceUrl } from '../urls'

type Props = ViewSpaceProps

export const AboutSpacePage: NextPage<Props> = (props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { spaceData } = props

  if (isUnlistedSpace(spaceData)) {
    return <SpaceNotFound />
  }

  const { owner } = props
  const space = spaceData.struct
  const { owner: spaceOwnerAddress } = space

  const [ content ] = useState(spaceData?.content || {} as SpaceContent)
  const { name, about, image, tags, links = [], email } = content

  const ContactInfo = useCallback(() => {
    if (isEmptyArray(links) && isEmptyStr(email)) return null

    const socialLinks = (links as string[]).map((x, i) => 
      ({ value: <SocialLink key={`${name}-socialLink-${i}`} link={x} label={name} />}))

    nonEmptyStr(email) && socialLinks.push({ value: <EmailLink link={email} label={name} /> })

    return <Section title={`${name} social links & contact info`} className='mb-4'>
      <InfoPanel
        column={2}
        items={socialLinks}
      />
    </Section>
  }, [])

  const title = `What is ${name}?`

  const meta = {
    title,
    desc: mdToText(about),
    image,
    canonical: aboutSpaceUrl(space)
  }

  return <PageContent meta={meta}>
    <Section 
      level={1}
      title={title}
      className='DfContentPage'
    >
      {nonEmptyStr(about) &&
        <div className='DfBookPage'>
          <DfMd source={about} />
        </div>
      }

      <ViewTags tags={tags} className='mb-4' />

      <ContactInfo />

      <Section title={`Owner of ${name} on ${appName}`} className='mb-4'>
        <Segment>
          <ProfilePreview address={spaceOwnerAddress} owner={owner} />
        </Segment>
      </Section>

      <Section title={`Follow ${name} on ${appName}`}>
        <ViewSpace
          spaceData={spaceData}
          withFollowButton
          withTags={false}
          withStats={true}
          preview
        />
      </Section>
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
