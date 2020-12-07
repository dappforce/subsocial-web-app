import AccountId from '@polkadot/types/generic/AccountId'
import { asAccountId } from '@subsocial/api/utils'
import { isDef, nonEmptyStr } from '@subsocial/utils'
import { Button, Form, Input, Modal } from 'antd'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { SpaceStruct } from 'src/types'
import { DfForm } from '../forms'
import { equalAddresses } from '../substrate'
import styles from './TransferSpaceOwnership.module.sass'

const TxButton = dynamic(() => import('src/components/utils/TxButton'), { ssr: false })

type LinkProps = {
  space: SpaceStruct
}

export const TransferOwnershipLink = (props: LinkProps) => {
  const [ open, setOpen ] = useState<boolean>(false)

  return <>
    <a
      className='DfBlackLink'
      onClick={() => setOpen(true)}
    >
      Transfer ownership
    </a>
    <TransferOwnershipModal {...props} open={open} onClose={() => setOpen(false)} />
  </>
}

type ModalProps = LinkProps & {
  open: boolean
  onClose: () => void
}

type FormValues = {
  newOwner?: string
}

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

const TransferOwnershipModal = (props: ModalProps) => {
  const { space, open, onClose: initialOnClose } = props
  const [ form ] = Form.useForm()
  const [ newOwner, setNewOwner ] = useState<AccountId>()
  const newOwnerRef = useRef(null)
  const currentOwner = space.ownerId

  useEffect(() => {
    if (!open) return
    
    const c = newOwnerRef.current
    if (!c) return

    (c as any).focus()
  }, [ currentOwner.toString(), open ])

  const resetState = () => {
    setNewOwner(undefined)
  }

  const onClose = () => {
    form.resetFields()
    resetState()
    if (typeof initialOnClose === 'function') {
      initialOnClose()
    }
  }

  const hasValidNewOwner = () => isDef(newOwner)

  const onTxSuccess: TxCallback = () => {
    onClose()
  }

  const onTxFailed: TxFailedCallback = () => {
    // Do noting
  }

  const getTxParams = () => {
    return [ space.id, newOwner ]
  }

  const renderTxButton = () =>
    <TxButton
      type='primary'
      label={'Transfer ownership'}
      disabled={!hasValidNewOwner()}
      params={getTxParams}
      tx={'spaceOwnership.transferSpaceOwnership'}
      onSuccess={onTxSuccess}
      onFailed={onTxFailed}
      successMessage='Transfer of ownership is started. Now the new owner can accept or reject it.'
      failedMessage='Failed to transfer space ownership'
    />

  return <Modal
    onCancel={onClose}
    visible={open}
    title={'Transfer space ownership'}
    width={600}
    footer={
      <>
        <Button onClick={onClose}>Cancel</Button>
        {renderTxButton()}
      </>
    }
  >
    <DfForm
      form={form}
      validateTrigger={[ 'onChange', 'onBlur' ]}
      layout='vertical'
      className={styles.TransferOwnershipForm}
    >
      <Form.Item
        name={fieldName('newOwner')}
        label='Account address of a new owner:'
        hasFeedback
        validateFirst={true} // stop validation on the first rule with error
        rules={[
          { required: true, message: 'Account address is required.' },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ getFieldValue }) => ({
            validator (_rule, value) {
              const fail = (errMsg: string) => {
                setNewOwner(undefined)
                return Promise.reject(errMsg)
              }
              if (nonEmptyStr(value)) {
                const maybeAcc = asAccountId(value.trim())
                if (maybeAcc) {
                  if (equalAddresses(currentOwner, maybeAcc)) {
                    return fail('This account already owns this space')
                  } else {
                    setNewOwner(maybeAcc)
                    return Promise.resolve()
                  }
                }
              }
              return fail('Invalid account address')
            },
          })
        ]}
      >
        <Input placeholder='Account address' ref={newOwnerRef} />
      </Form.Item>
    </DfForm>
    {/* <p>Current owner: {currentOwner.toString()}</p>
    {newOwner && <p>New owner: {newOwner.toString()}</p>} */}
  </Modal>
}
