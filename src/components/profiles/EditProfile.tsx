import React, { useState } from 'react'
import { Form, Input } from 'antd'
import Router from 'next/router'
import Section from '../utils/Section'
import { getTxParams } from '../substrate'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { ProfileUpdate, OptionIpfsContent, IpfsContent } from '@subsocial/types/substrate/classes'
import { IpfsCid } from '@subsocial/types/substrate/interfaces'
import { AnyAccountId, ProfileContent } from '@subsocial/types'
import { ProfileData } from 'src/types'
import { newLogger } from '@subsocial/utils'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { DfForm, DfFormButtons, minLenError, maxLenError } from '../forms'
import DfMdEditor from '../utils/DfMdEditor'
import { withMyProfile } from './address-views/utils/withLoadedOwner'
import { accountUrl } from '../urls'
import { NAME_MIN_LEN, NAME_MAX_LEN, DESC_MAX_LEN } from 'src/config/ValidationsConfig'
import { UploadAvatar } from '../uploader'
import messages from 'src/messages'
import { clearAutoSavedContent } from '../utils/DfMdEditor/client'
import { PageContent } from '../main/PageWrapper'
import { AutoSaveId } from '../utils/DfMdEditor/types'

const log = newLogger('EditProfile')

type Content = ProfileContent

type FormValues = Partial<Content>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type FormProps = {
  address: AnyAccountId,
  owner?: ProfileData
}

function getInitialValues ({ owner }: FormProps): FormValues {
  if (owner) {
    const { content } = owner
    return { ...content }
  }
  return {}
}

export function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const [ IpfsCid, setIpfsCid ] = useState<IpfsCid>()

  const { owner, address } = props
  const hasProfile = owner?.struct.hasProfile === true
  const initialValues = getInitialValues(props)

  // Auto save a profile's about only if we are on a "New Profile" form.
  const autoSaveId: AutoSaveId | undefined = !hasProfile ? 'profile' : undefined

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    // const fieldValues = getFieldValues()

    // /** Returns `undefined` if value hasn't been changed. */
    // function getValueIfChanged (field: FieldName): any | undefined {
    //   return form.isFieldTouched(field) ? fieldValues[field] as any : undefined
    // }

    /** Returns `undefined` if CID hasn't been changed. */
    function getCidIfChanged (): IpfsCid | undefined {
      const prevCid = owner?.struct.contentId
      return prevCid !== cid.toString() ? cid : undefined
    }

    if (!hasProfile) {
      // If creating a new profile.
      return [ new IpfsContent(cid) ]
    } else {
      // If updating the existing profile.

      // TODO Update only dirty values.

      const update = new ProfileUpdate({
        content: new OptionIpfsContent(getCidIfChanged())
      })

      return [ update ]
    }
  }

  const fieldValuesToContent = (): Content => {
    return getFieldValues() as Content
  }

  // TODO pin to IPFS only if JSON changed.
  const pinToIpfsAndBuildTxParams = () => getTxParams({
    json: fieldValuesToContent(),
    buildTxParamsCallback: newTxParams,
    setIpfsCid,
    ipfs
  })

  const goToView = () => {
    if (address) {
      Router.push('/accounts/[address]', accountUrl({ address }))
        .catch(err => log.error('Failed to redirect to "View Account" page:', err))
    }
  }

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = () => {
    clearAutoSavedContent('profile')
    goToView()
  }

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('about')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('avatar')]: url })
  }

  return <>
    <DfForm form={form} initialValues={initialValues}>

      <Form.Item
        name={fieldName('avatar')}
        label='Avatar'
        help={messages.imageShouldBeLessThanTwoMB}
      >
        <UploadAvatar onChange={onAvatarChanged} img={initialValues.avatar} />
      </Form.Item>

      <Form.Item
        name={fieldName('name')}
        label='Profile name'
        hasFeedback
        rules={[
          // { required: true, message: 'Name is required.' },
          { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
          { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) }
        ]}
      >
        <Input placeholder='Full name or nickname' />
      </Form.Item>

      <Form.Item
        name={fieldName('about')}
        label='About'
        hasFeedback
        rules={[
          { max: DESC_MAX_LEN, message: maxLenError('Description', DESC_MAX_LEN) }
        ]}
      >
        <DfMdEditor autoSaveId={autoSaveId} onChange={onDescChanged} />
      </Form.Item>

      <DfFormButtons
        form={form}
        txProps={{
          label: hasProfile
            ? 'Update profile'
            : 'Create new profile',
          tx: hasProfile
            ? 'profiles.updateProfile'
            : 'profiles.createProfile',
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

export function FormInSection (props: FormProps) {
  const { owner } = props
  const title = owner?.struct.hasProfile ? 'Edit profile' : 'New profile'

  return <PageContent meta={{ title }}>
    <Section className='EditEntityBox' title={title}>
      <InnerForm {...props} />
    </Section>
  </PageContent>
}

export const EditProfile = withMyProfile(FormInSection)

export const NewProfile = withMyProfile(FormInSection)

export default NewProfile
