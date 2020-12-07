import { SpaceContent } from '@subsocial/types/offchain'
import { isEmptyArray, isEmptyStr, nonEmptyStr } from '@subsocial/utils'
import { NextPage } from 'next'
import Error from 'next/error'
import React, { useCallback, useState } from 'react'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { mdToText } from 'src/utils'
import { PageContent } from '../main/PageWrapper'
import { ProfilePreview } from '../profiles/address-views'
import { InfoPanel } from '../profiles/address-views/InfoSection'
import { aboutSpaceUrl } from '../urls'
import { DfMd } from '../utils/DfMd'
import { appName } from '../utils/env'
import Section from '../utils/Section'
import Segment from '../utils/Segment'
import ViewTags from '../utils/ViewTags'
import { isUnlistedSpace, SpaceNotFound } from './helpers'
import { loadSpaceOnNextReq } from './helpers/loadSpaceOnNextReq'
import { EmailLink, SocialLink } from './SocialLinks/ViewSocialLinks'
import { ViewSpace } from './ViewSpace'
import { ViewSpaceProps } from './ViewSpaceProps'

type Props = ViewSpaceProps

export const AboutSpacePage: NextPage<Props> = (props) => {
  const { statusCode, spaceData } = props

  // TODO copypasta, see ViewSpacePage
  if (statusCode === 404) {
    return <Error statusCode={statusCode} />
  }

  if (isUnlistedSpace(spaceData)) {
    return <SpaceNotFound />
  }

  const { struct: space, owner } = spaceData
  const { ownerId: spaceOwnerAddress } = space

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

getInitialPropsWithRedux(AboutSpacePage, async (props) => {
  const spaceData = await loadSpaceOnNextReq(props, aboutSpaceUrl)
  return { spaceData }
})

export default AboutSpacePage
