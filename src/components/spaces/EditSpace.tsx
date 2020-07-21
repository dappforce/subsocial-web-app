import React, { useState } from 'react'
import { Form, Input, Select } from 'antd'
import Router, { useRouter } from 'next/router'
import BN from 'bn.js'

import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { getSpaceId, getNewIdFromEvent, equalAddresses, stringifyText, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { Option } from '@polkadot/types'
import { SpaceUpdate, OptionOptionText, OptionText, OptionBool } from '@subsocial/types/substrate/classes'
import { IpfsHash } from '@subsocial/types/substrate/interfaces'
import { SpaceContent, SpaceData, CommonContent } from '@subsocial/types'
import { newLogger } from '@subsocial/utils'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useMyAddress } from '../auth/MyAccountContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import { Loading } from '../utils'
import NoData from '../utils/EmptyList'
import { Codec } from '@polkadot/types/types'
import DfMdEditor from '../utils/DfMdEditor'

const log = newLogger(EditSpace.name)

const NAME_MIN_LEN = 3
const NAME_MAX_LEN = 100

type FormValues = Partial<SpaceContent & {
  handle: string
}>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type LoadedDataProps = Partial<SpaceData>

type ValidationProps = {
  minHandleLen: number
  maxHandleLen: number
}

type OuterProps = ValidationProps & LoadedDataProps & {
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
  const { ipfs } = useSubsocialApi()
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>()

  const { spaceId, struct, minHandleLen, maxHandleLen } = props
  const initialValues = getInitialValues(props)
  const tags = initialValues.tags || []

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsHash) => {
    const { handle } = getFieldValues()
    if (!struct) {
      return [ new OptionText(handle), cid ]
    } else {

      // TODO update only dirty values. !!!

      const update = new SpaceUpdate({
        handle: new OptionOptionText(handle),
        ipfs_hash: new OptionText(cid),
        hidden: new OptionBool()
      })
      return [ struct.id, update ]
    }
  }

  const pinToIpfsAndBuildTxParams = () => {
    const { handle, ...json } = getFieldValues()
    return getTxParams({
      json: json as CommonContent,
      buildTxParamsCallback: newTxParams,
      setIpfsHash,
      ipfs
    })
  }

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

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('desc')]: mdText })
  }

  return <>
    <DfForm form={form} initialValues={initialValues}>
      <Form.Item
        name={fieldName('name')}
        label='Space name'
        hasFeedback
        rules={[
          { required: true, message: 'Name is required.' },
          { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
          { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) }
        ]}
      >
        <Input placeholder='Name of your space' />
      </Form.Item>

      <Form.Item
        name={fieldName('handle')}
        label='URL handle'
        hasFeedback
        rules={[
          { pattern: /^[A-Za-z0-9_]+$/, message: 'Handle can have only letters (a-z, A-Z), numbers (0-9) and underscores (_).' },
          { min: minHandleLen, message: minLenError('Handle', minHandleLen) },
          { max: maxHandleLen, message: maxLenError('Handle', maxHandleLen) }
          // TODO test that handle is unique via a call to Substrate
        ]}
      >
        <Input placeholder='You can use a-z, 0-9 and underscores' />
      </Form.Item>

      <Form.Item
        name={fieldName('image')}
        label='Avatar URL'
        hasFeedback
        rules={[
          { type: 'url', message: 'Should be a valid image URL.' }
        ]}
      >
        <Input type='url' placeholder='Image URL' />
      </Form.Item>

      <Form.Item
        name={fieldName('desc')}
        label='Description'
        hasFeedback
      >
        <DfMdEditor onChange={onDescChanged} />
      </Form.Item>

      <Form.Item
        name={fieldName('tags')}
        label='Tags'
        hasFeedback
      >
        <Select
          mode='tags'
          placeholder="Press 'Enter' or 'Tab' key to add tags"
        >
          {tags.map((tag, i) =>
            <Select.Option key={i} value={tag} children={tag} />
          )}
        </Select>
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

function bnToNum (bn: Codec, _default: number): number {
  return bn ? (bn as unknown as BN).toNumber() : _default
}

export function FormInSection (props: OuterProps) {
  const [ consts, setConsts ] = useState<ValidationProps>()
  const { struct } = props
  const title = struct ? `Edit space` : `New space`

  useSubsocialEffect(({ substrate }) => {
    const load = async () => {
      const api = await substrate.api
      setConsts({
        minHandleLen: bnToNum(api.consts.spaces.minHandleLen, 5),
        maxHandleLen: bnToNum(api.consts.spaces.maxHandleLen, 50)
      })
    }
    load()
  }, [ false ])

  return <>
    <HeadMeta title={title} />
    <Section className='EditEntityBox' title={title}>
      <InnerForm {...props} {...consts} />
    </Section>
  </>
}

export const NewSpace = FormInSection

export function EditSpace (props: OuterProps) {
  const idOrHandle = useRouter().query.spaceId as string
  const myAddress = useMyAddress()
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ loadedData, setLoadedData ] = useState<LoadedDataProps>()

  useSubsocialEffect(({ subsocial }) => {
    const load = async () => {
      const id = await getSpaceId(idOrHandle)
      if (!id) return

      setIsLoaded(false)
      setLoadedData(await subsocial.findSpace({ id }))
      setIsLoaded(true)
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
