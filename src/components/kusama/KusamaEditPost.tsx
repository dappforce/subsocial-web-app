import React, { useState, useEffect, useCallback } from 'react'
import { Form } from 'antd'
import { DfForm } from '../forms'
import { useKusamaContext } from '../kusama/KusamaContext'
import Input from 'antd/lib/input/Input'
import { getInitialValues, PostForm as InnerForm, PostFormProps } from '../posts/EditPost'
import { KusamaProposalView } from './KusamaProposalDesc'
import { ProposalContent } from '@subsocial/types'

export const KusamaProposalForm = (props: PostFormProps) => {
  const { api, hasKusamaConnection } = useKusamaContext()
  const [ lastProposaCount, setCount ] = useState<number>()
  const [ proposalIndex, setIndex ] = useState<number>()
  const [form] = Form.useForm()
  const initialValues = getInitialValues(props)

  useEffect(() => {
    if (!api) return

    api.query.treasury.proposalCount()
      .then(x => setCount(x.toNumber()))
  })

  const proposal: ProposalContent | undefined = proposalIndex ? { proposalIndex, network: 'kusama' } : undefined

  console.log('Proposal', proposal)

  const PostForm = useCallback(
    () => proposalIndex ? <InnerForm {...props} ext={{ proposal }} /> : null,
    [ proposalIndex || 0 ])

  if (!lastProposaCount || !hasKusamaConnection) return null

  return <>
    <DfForm
      form={form}
      validateTrigger='onChange'
      initialValues={initialValues}
      className='mb-3'
    >
      <Form.Item
        name='proposalIndex'
        label='Kusama proposal index'
        hasFeedback
        rules={[
          { required: true, message: 'Proposal index is required.' },
          ({ getFieldValue }) => ({
            async validator() {
              const proposalIndex = getFieldValue('proposalIndex')
              console.log('INDEX', proposalIndex)
              const isValid = proposalIndex <= lastProposaCount
              if (isValid) {
                setIndex(proposalIndex)
                return Promise.resolve();
              }
              setIndex(undefined)
              return Promise.reject(new Error(`There are ${lastProposaCount} proposals in Kusama Treasury`));
            }
          })
        ]}
      >
        <Input placeholder='Proposal index' type='number' />
      </Form.Item>
    </DfForm>
    <KusamaProposalView proposal={proposal} />
    <PostForm />
  </>
}

