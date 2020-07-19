import React, { useState } from 'react'
import { Form, Input } from 'antd'
import Router, { useRouter } from 'next/router'
import BN from 'bn.js'

import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { getSpaceId, getNewIdFromEvent, equalAddresses, stringifyText } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { IpfsHash } from '@subsocial/types/substrate/interfaces'
import { SpaceContent, SpaceData } from '@subsocial/types'
import { newLogger } from '@subsocial/utils'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { ValidationProps } from './SpaceValidation'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useMyAddress } from '../auth/MyAccountContext'
import { DfForm, DfFormButtons } from '../forms'
import { Loading } from '../utils'
import NoData from '../utils/EmptyList'

const log = newLogger(EditSpace.name)

type FormValues = Partial<SpaceContent & {
  handle: string
}>

export type FieldNames = {
  [s: string]: keyof FormValues
}

const FieldNames = {
  handle: 'handle',
  name: 'name',
  desc: 'desc',
  image: 'image',
  tags: 'tags'
}

type LoadedProps = Partial<SpaceData>

type OuterProps = ValidationProps & LoadedProps & {
  spaceId?: BN
}

function getInitialValues (props: OuterProps): FormValues {
  const { struct, content } = props
  if (!struct) return {}

  const handle = stringifyText<string>(struct.handle)
  return { ...content, handle }
}

export function InnerForm (props: OuterProps) {
  const [ form ] = Form.useForm()
  const { spaceId, struct } = props
  const { ipfs } = useSubsocialApi()
  const [ ipfsHash ] = useState<IpfsHash>()
  const initialValues = getInitialValues(props)

  const pinToIpfsAndBuildTxParams = () =>
    [] // TODO mock
    // getTxParams({
    //   json: { name, desc, image, tags, navTabs },
    //   buildTxParamsCallback: newTxParams,
    //   setIpfsHash,
    //   ipfs
    // })

  const onFailed: TxFailedCallback = () => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = (txResult) => {
    const _id = spaceId || getNewIdFromEvent(txResult)
    _id && goToView(_id)
  }

  const goToView = (spaceId: BN) => {
    Router.push('/spaces/' + spaceId.toString())
      .catch(err => log.error(`Failed to redirect to a space page. ${err}`))
  }

  return <>
    <DfForm form={form} initialValues={initialValues}>
      <Form.Item
        name={FieldNames.handle}
        label='URL handle'
        hasFeedback
        rules={[
          // { required: true },
          { pattern: /^[A-Za-z0-9_]+$/, message: 'Handle can have only letters (a-z, A-Z), numbers (0-9) and underscores (_)' }
          // TODO test that handle is unique
        ]}
      >
        <Input placeholder='You can use a-z, 0-9 and underscores.' />
      </Form.Item>

      <DfFormButtons
        form={form}
        txProps={{
          label: struct
            ? 'Update space'
            : 'Create new space',
          tx: struct
            ? 'spaces.updateSpace'
            : 'spaces.createSpace',
          params: pinToIpfsAndBuildTxParams,
          onSuccess,
          onFailed
        }}
      />
    </DfForm>
  </>
}

// TODO load data from minHandleLen, maxHandleLen

export function FormInSection (props: OuterProps) {
  const { struct } = props
  const title = struct ? `Edit space` : `New space`

  return <>
    <HeadMeta title={title} />
    <Section className='EditEntityBox' title={title}>
      <InnerForm {...props} />
    </Section>
  </>
}

export const NewSpace = FormInSection

export function EditSpace (props: OuterProps) {
  const idOrHandle = useRouter().query.spaceId as string
  const myAddress = useMyAddress()
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ loadedData, setLoadedData ] = useState<LoadedProps>()

  useSubsocialEffect(({ subsocial }) => {
    const load = async () => {
      const id = await getSpaceId(idOrHandle)
      if (!id) return

      setIsLoaded(false)
      const data = await subsocial.findSpace({ id })
      setIsLoaded(true)

      const canEdit = data && equalAddresses(myAddress, data.struct.owner)
      canEdit && setLoadedData(data)
    }
    load()
  }, [ idOrHandle ])

  if (!isLoaded) return <Loading label='Loading the space...' />

  if (!loadedData) return <NoData description='Space not found' />

  const isOwner = equalAddresses(myAddress, loadedData?.struct?.owner)
  if (!isOwner) return <NoData description="You don't have permission to edit this space" />

  return <FormInSection {...props} {...loadedData} />
}

export default NewSpace
