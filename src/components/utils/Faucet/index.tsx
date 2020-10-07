import styles from './index.module.sass'
import React, { useState } from 'react'
import { Steps, Button } from 'antd'
import { PageContent } from 'src/components/main/PageWrapper'
import HeadMeta from '../HeadMeta'
import Section from '../Section'
import { Step1ButtonName, Step1Content } from './Step1'
import { Step2ButtonName, Step2Content } from './Step2'
import { Step3ButtonName, Step3Content } from './Step3'
import ButtonLink from '../ButtonLink'

const { Step } = Steps

const steps = [
  {
    title: 'Follow Subsocial',
    button: Step1ButtonName,
    content: <Step1Content />
  },
  {
    title: 'Understand Tokens',
    button: Step2ButtonName,
    content: <Step2Content />
  },
  {
    title: 'Request Tokens',
    button: Step3ButtonName,
    content: <Step3Content />
  }
]

export const Faucet = () => {
  const [ current, setCurrent ] = useState(0)

  const prev = () => {
    setCurrent(current - 1)
  }

  const next = () => {
    setCurrent(current + 1)
  }

  const title = 'Subsocial Token Faucet (SMN)'

  return <PageContent>
    <HeadMeta title={title} desc='Get free tokens for a decentralized social network.' />
    <Section className={`DfContentPage ${styles.Faucet}`} title={title}>
      <Steps current={current} className='mt-3'>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className='DfBookPage'>
        {steps[current].content}
      </div>
      <div className='float-right'>
        {current > 0 && (
          <Button className='mr-3' onClick={prev}>
            Previous
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type='primary' onClick={next}>
            {steps[current].button}
          </Button>
        )}
        {current === steps.length - 1 && (
          <ButtonLink type='primary' href='https://t.me/joinchat/MDeWpRoYQtab1URrwit12Q' target='_blank'>
            {steps[current].button}
          </ButtonLink>
        )}
      </div>
    </Section>
  </PageContent>
}

export default Faucet
