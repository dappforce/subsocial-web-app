import { PageContent } from 'src/components/main/PageWrapper'
import { Section } from 'src/components/utils/Section'

// Deprecated: Old Telegram faucet.
// export const page = () => <Faucet />

const title = 'Subsocial Token Faucet (SMN)'

export const page = () => (
  <PageContent
    meta={{
      title,
      desc: 'Get free tokens for a decentralized social network.'
    }}
  >
    <Section className={'DfContentPage'} title={title}>
      <p>⚠️ The faucet is temporarily disabled. ⚠️ We are working on a new version of it.</p>
      <p>
        Follow us on Twitter
        (<a target='_blank' rel='noreferrer' href='https://twitter.com/SubsocialChain'>@SubsocialChain</a>)
        and Telegram
        (<a target='_blank' rel='noreferrer' href='https://t.me/Subsocial'>@Subsocial</a>)
        to not miss important announcements.
      </p>
      <p>Sorry for the inconvenience 🙏.</p>
    </Section>
  </PageContent>
)

export default page
