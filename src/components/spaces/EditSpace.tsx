import React, { useState } from 'react'
import { Form, Input, Select } from 'antd'
import Router from 'next/router'
import BN from 'bn.js'
import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { getNewIdFromEvent, equalAddresses, stringifyText, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { SpaceUpdate, OptionBool, OptionIpfsContent, OptionOptionText, OptionText, OptionId, IpfsContent } from '@subsocial/types/substrate/classes'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import { SpaceContent } from '@subsocial/types'
import { newLogger } from '@subsocial/utils'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { useMyAddress } from '../auth/MyAccountContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import NoData from '../utils/EmptyList'
import DfMdEditor from '../utils/DfMdEditor'
import { withLoadSpaceFromUrl, CheckSpacePermissionFn, CanHaveSpaceProps } from './withLoadSpaceFromUrl'
import { NAME_MIN_LEN, NAME_MAX_LEN, DESC_MAX_LEN, MIN_HANDLE_LEN, MAX_HANDLE_LEN } from 'src/config/ValidationsConfig'

const log = newLogger('EditSpace')

const MAX_TAGS = 5

type Content = SpaceContent

type FormValues = Partial<Content & {
  handle: string
}>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type ValidationProps = {
  minHandleLen: number
  maxHandleLen: number
}

type FormProps = CanHaveSpaceProps & ValidationProps

function getInitialValues ({ space }: FormProps): FormValues {
  if (space) {
    const { struct, content } = space
    const handle = stringifyText<string>(struct.handle)
    return { ...content, handle }
  }
  return {}
}

export function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()

  const { space, minHandleLen, maxHandleLen } = props
  const initialValues = getInitialValues(props)
  const tags = initialValues.tags || []

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    const fieldValues = getFieldValues()

    /** Returns `undefined` if value hasn't been changed. */
    function getValueIfChanged (field: FieldName): any | undefined {
      return form.isFieldTouched(field) ? fieldValues[field] as any : undefined
    }

    /** Returns `undefined` if CID hasn't been changed. */
    function getCidIfChanged (): IpfsCid | undefined {
      const prevCid = stringifyText(space?.struct?.content.asIpfs)
      return prevCid !== cid.toString() ? cid : undefined
    }

    if (!space) {
      return [ new OptionId(), new OptionText(fieldValues.handle), new IpfsContent(cid) ]
    } else {
      // Update only dirty values.

      // TODO seems like we cannot set a handle to None.

      // TODO uupdate SpaceUpdate class
      const update = new SpaceUpdate({
        handle: new OptionOptionText(getValueIfChanged('handle')),
        content: new OptionIpfsContent(getCidIfChanged()),
        hidden: new OptionBool()
      })
      return [ space.struct.id, update ]
    }
  }

  const fieldValuesToContent = (): Content => {
    const { name, desc, image, tags, navTabs } = getFieldValues()
    return { name, desc, image, tags, navTabs } as Content
  }

  // TODO pin to IPFS only if JSON changed.
  const pinToIpfsAndBuildTxParams = () => getTxParams({
    json: fieldValuesToContent(),
    buildTxParamsCallback: newTxParams,
    setIpfsCid,
    ipfs
  })

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = (txResult) => {
    const id = space?.struct.id || getNewIdFromEvent(txResult)
    id && goToView(id)
  }

  const goToView = (spaceId: BN) => {
    Router.push('/spaces/[spaceId]', `/spaces/${spaceId}`)
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
        rules={[
          { max: DESC_MAX_LEN, message: maxLenError('Description', DESC_MAX_LEN) }
        ]}
      >
        <DfMdEditor onChange={onDescChanged} />
      </Form.Item>

      <Form.Item
        name={fieldName('tags')}
        label='Tags'
        hasFeedback
        rules={[
          { type: 'array', max: MAX_TAGS, message: `You can use up to ${MAX_TAGS} tags.` }
        ]}
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
          label: space
            ? 'Update space'
            : 'Create new space',
          tx: space
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

// function bnToNum (bn: Codec, _default: number): number {
//   return bn ? (bn as unknown as BN).toNumber() : _default
// }

export function FormInSection (props: Partial<FormProps>) {
  const [ consts ] = useState<ValidationProps>({
    minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.spaces.minHandleLen, 5),
    maxHandleLen: MAX_HANDLE_LEN // bnToNum(api.consts.spaces.maxHandleLen, 50)
  })
  const { space } = props
  const title = space ? `Edit space` : `New space`

  // useSubsocialEffect(({ substrate }) => {
  //   const load = async () => {
  //     // const api = await substrate.api
  //     setConsts({
  //       minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.spaces.minHandleLen, 5),
  //       maxHandleLen: MAX_HANDLE_LEN // bnToNum(api.consts.spaces.maxHandleLen, 50)
  //     })
  //   }
  //   load()
  // }, [])

  return <>
    <HeadMeta title={title} />
    <Section className='EditEntityBox' title={title}>
      <InnerForm {...props} {...consts} />
    </Section>
  </>
}

const CannotEditSpace = <NoData description='You do not have permission to edit this space' />

const LoadSpaceThenEdit = withLoadSpaceFromUrl(FormInSection)

export function EditSpace (props: FormProps) {
  const myAddress = useMyAddress()

  const checkSpacePermission: CheckSpacePermissionFn = space => {
    const isOwner = space && equalAddresses(myAddress, space.struct.owner)
    return {
      ok: isOwner,
      error: () => CannotEditSpace
    }
  }

  return <LoadSpaceThenEdit {...props} checkSpacePermission={checkSpacePermission} />
}

export const NewSpace = FormInSection

export default NewSpace
