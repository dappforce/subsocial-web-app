import React, { useState } from 'react'
import { Form, Input, Select } from 'antd'
import Section from '../utils/Section'
import { getNewIdFromEvent, equalAddresses, stringifyText, getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { SpaceUpdate, OptionBool, OptionIpfsContent, OptionOptionText, OptionText, OptionId, IpfsContent } from '@subsocial/types/substrate/classes'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import { SpaceContent } from '@subsocial/types'
import { isEmptyStr } from '@subsocial/utils'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { useMyAddress } from '../auth/MyAccountContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import NoData from '../utils/EmptyList'
import DfMdEditor from '../utils/DfMdEditor'
import { withLoadSpaceFromUrl, CheckSpacePermissionFn, CanHaveSpaceProps } from './withLoadSpaceFromUrl'
import { NAME_MIN_LEN, NAME_MAX_LEN, DESC_MAX_LEN, MIN_HANDLE_LEN, MAX_HANDLE_LEN } from 'src/config/ValidationsConfig'
import { NewSocialLinks } from './SocialLinks/NewSocialLinks'
import { UploadAvatar } from '../uploader'
import { MailOutlined } from '@ant-design/icons'
import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { getNonEmptySpaceContent } from '../utils/content'
import messages from 'src/messages'
import { clearAutoSavedContent } from '../utils/DfMdEditor/client'
import { PageContent } from '../main/PageWrapper'
import { goToSpacePage } from '../urls/goToPage'
import { AutoSaveId } from '../utils/DfMdEditor/types'
import { idToBn, SpaceId } from 'src/types'
import { useCreateReloadSpace } from 'src/rtk/app/hooks'

const MAX_TAGS = 10

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

const isHandleUnique = async (substrate: SubsocialSubstrateApi, handle: string, mySpaceId?: SpaceId) => {
  if (isEmptyStr(handle)) return true

  const spaceIdByHandle = await substrate.getSpaceIdByHandle(handle.trim().toLowerCase())

  if (!spaceIdByHandle) return true

  if (mySpaceId) return spaceIdByHandle.eq(idToBn(mySpaceId))

  return !spaceIdByHandle
}

export function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const { ipfs, substrate } = useSubsocialApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()
  const reloadSpace = useCreateReloadSpace()
  const { space, minHandleLen, maxHandleLen } = props

  const initialValues = getInitialValues(props)
  const tags = initialValues.tags || []
  const links = initialValues.links

  // Auto save a space's about only if we are on a "New Space" form.
  const autoSaveId: AutoSaveId | undefined = !space ? 'space' : undefined

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
      const prevCid = space?.struct.contentId
      return prevCid !== cid.toString() ? cid : undefined
    }

    if (!space) {
      // If creating a new space.
      return [ new OptionId(), new OptionText(fieldValues.handle), new IpfsContent(cid) ]
    } else {
      // If updating the existing space.
      
      // TODO Update only dirty values.

      // TODO Seems like we cannot set a handle to None. Check it.

      // TODO Update SpaceUpdate class
      const update = new SpaceUpdate({
        handle: new OptionOptionText(getValueIfChanged('handle')),
        content: new OptionIpfsContent(getCidIfChanged()),
        hidden: new OptionBool()
      })
      return [ space.struct.id, update ]
    }
  }

  const fieldValuesToContent = (): Content =>
    getNonEmptySpaceContent(getFieldValues() as Content)

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
    const id = space?.struct.id || getNewIdFromEvent(txResult)?.toString()
    
    clearAutoSavedContent('space')
    if (id) {
      reloadSpace({ id })
      goToSpacePage(id)
    }
  }

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('about')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }

  return <>
    <DfForm form={form} validateTrigger={[ 'onBlur' ]} initialValues={initialValues}>
      <Form.Item
        name={fieldName('image')}
        label='Avatar'
        help={messages.imageShouldBeLessThanTwoMB}
      >
        <UploadAvatar onChange={onAvatarChanged} img={initialValues.image} />
      </Form.Item>

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
        label='Handle'
        help='This should be a unique handle that will be used in a URL of your space'
        hasFeedback
        rules={[
          { pattern: /^[A-Za-z0-9_]+$/, message: 'Handle can have only letters (a-z, A-Z), numbers (0-9) and underscores (_).' },
          { min: minHandleLen, message: minLenError('Handle', minHandleLen) },
          { max: maxHandleLen, message: maxLenError('Handle', maxHandleLen) },
          ({ getFieldValue }) => ({
            async validator () {
              const handle = getFieldValue(fieldName('handle'))
              const isUnique = await isHandleUnique(substrate, handle, space?.struct.id)
              if (isUnique) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('This handle is already taken. Please choose another.'))
            }
          })
        ]}
      >
        <Input placeholder='You can use a-z, 0-9 and underscores' />
      </Form.Item>

      <Form.Item
        name={fieldName('about')}
        label='Description'
        hasFeedback
        rules={[
          { max: DESC_MAX_LEN, message: maxLenError('Description', DESC_MAX_LEN) }
        ]}
      >
        <DfMdEditor autoSaveId={autoSaveId} onChange={onDescChanged} />
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
            <Select.Option key={i} value={tag}>{tag}</Select.Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item
        name={fieldName('email')}
        label={<span><MailOutlined /> Email address</span>}
        rules={[
          { pattern: /\S+@\S+\.\S+/, message: 'Should be a valid email' }
        ]}>
        <Input type='email' placeholder='Email address' />
      </Form.Item>

      <NewSocialLinks name='links' links={links} collapsed={!links} />

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
  const title = space ? 'Edit space' : 'New space'

  // useSubsocialEffect(({ substrate }) => {
  //   let isMounted = true

  //   const load = async () => {
  //     // const api = await substrate.api
  //     isMounted && setConsts({
  //       minHandleLen: MIN_HANDLE_LEN, // TODO bnToNum(api.consts.utils.minHandleLen, 5),
  //       maxHandleLen: MAX_HANDLE_LEN  // TODO bnToNum(api.consts.utils.maxHandleLen, 50)
  //     })
  //   }

  //   load()

  //   return () => { isMounted = false }
  // }, [])

  return <PageContent meta={{ title }}>
    <Section className='EditEntityBox' title={title}>
      <InnerForm {...props} {...consts} />
    </Section>
  </PageContent>
}

const CannotEditSpace = <NoData description='You do not have permission to edit this space' />

const LoadSpaceThenEdit = withLoadSpaceFromUrl(FormInSection)

export function EditSpace (props: FormProps) {
  const myAddress = useMyAddress()

  const checkSpacePermission: CheckSpacePermissionFn = space => {
    const isOwner = space && equalAddresses(myAddress, space.struct.ownerId)
    return {
      ok: isOwner,
      error: () => CannotEditSpace
    }
  }

  return <LoadSpaceThenEdit {...props} checkSpacePermission={checkSpacePermission} />
}

export const NewSpace = FormInSection

export default NewSpace
