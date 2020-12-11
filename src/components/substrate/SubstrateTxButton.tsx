import React from 'react'
import Button, { ButtonProps } from 'antd/lib/button'

import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { SubmittableResult } from '@polkadot/api'
import { AddressOrPair } from '@polkadot/api/submittable/types'
import { web3FromSource } from '@polkadot/extension-dapp'
import { isFunction } from '@polkadot/util'

import { newLogger, isEmptyStr, nonEmptyArr, nonEmptyStr } from '@subsocial/utils'
import { useSubstrate } from '.'
import useToggle from './useToggle'
import { Message, showSuccessMessage, showErrorMessage, controlledMessage } from '../utils/Message'
import { useAuth } from '../auth/AuthContext'
import { VoidFn } from '@polkadot/api/types'
import { LoadingOutlined } from '@ant-design/icons'
import { useClientNonce, useMyAccount } from '../auth/MyAccountContext'

const log = newLogger('TxButton')

export type GetTxParamsFn = () => any[]
export type GetTxParamsAsyncFn = () => Promise<any[]>

export type TxCallback = (status: SubmittableResult) => void
export type TxFailedCallback = (status: SubmittableResult | null) => void

type SuccessMessageFn = (status: SubmittableResult) => Message
type FailedMessageFn = (status: SubmittableResult | null) => Message

type SuccessMessage = Message | SuccessMessageFn
type FailedMessage = Message | FailedMessageFn

export type BaseTxButtonProps = Omit<ButtonProps, 'onClick' | 'form'>

export type TxButtonProps = BaseTxButtonProps & {
  accountId?: AddressOrPair
  tx?: string
  params?: any[] | GetTxParamsFn | GetTxParamsAsyncFn
  label?: React.ReactNode
  title?: string
  unsigned?: boolean
  onValidate?: () => boolean | Promise<boolean>
  onClick?: () => void
  onSuccess?: TxCallback
  onFailed?: TxFailedCallback
  successMessage?: SuccessMessage
  failedMessage?: FailedMessage
  withSpinner?: boolean
  component?: React.FunctionComponent
}

export function TxButton ({
  accountId,
  tx,
  params,
  label,
  disabled,
  unsigned,
  onValidate,
  onClick,
  onSuccess,
  onFailed,
  successMessage,
  failedMessage,
  withSpinner,
  component,
  children,
  ...antdProps
}: TxButtonProps) {

  const { api, keyring, keyringState } = useSubstrate()
  const [ isSending, , setIsSending ] = useToggle(false)
  const { openSignInModal, state: { completedSteps: { hasTokens } } } = useAuth()
  const { incClientNonce } = useMyAccount()
  const nonce = useClientNonce()

  const waitMessage = controlledMessage({
    message: 'Waiting for transaction completed...',
    type: 'info',
    duration: 0,
    icon: <LoadingOutlined />
  })

  let unsub: VoidFn | undefined

  const isAuthRequired = !accountId || !hasTokens
  const buttonLabel = label || children
  const Component = component || Button

  if (!api || !api.isReady) {
    return (
      <Component
        {...antdProps}
        disabled={true}
      >{buttonLabel}</Component>
    )
  }

  // TODO Try to cache this with useCallback
  const requireKeyPair = () => {
    const isAccountAddress =
      nonEmptyStr(accountId) ||
      nonEmptyArr(accountId)

    const keyPair =
      isAccountAddress &&
      keyring &&
      keyringState === 'READY' &&
      keyring.getPair(accountId as string)

    if (!keyPair) {
      throw new Error(`Keyring pair not found for account: ${accountId?.toString()}`)
    }

    return keyPair
  }

  const getAccount = async () => {
    if (!accountId) {
      throw new Error('Account id is undefined')
    }

    const {
      address,
      meta: { source, isInjected }
    } = requireKeyPair()

    let fromAccount = accountId

    // Get signer is from Polkadot-js browser extension
    if (isInjected) {
      const injected = await web3FromSource(source as string)
      fromAccount = address
      api.setSigner(injected.signer)
    }

    return fromAccount
  }

  const getExtrinsic = async (): Promise<SubmittableExtrinsic> => {
    const [ pallet, method ] = (tx || '').split('.')

    if (!api.tx[pallet]) {
      throw new Error(`Unable to find api.tx.${pallet}`)
    } else if (!api.tx[pallet][method]) {
      throw new Error(`Unable to find api.tx.${pallet}.${method}`)
    }

    let resultParams = (params || []) as any[]
    if (isFunction(params)) {
      resultParams = await params()
    }

    return api.tx[pallet][method](...(resultParams))
  }

  const doOnSuccess: TxCallback = (result) => {
    isFunction(onSuccess) && onSuccess(result)

    const message: Message = isFunction(successMessage)
      ? successMessage(result)
      : successMessage

    message && showSuccessMessage(message)
  }

  const doOnFailed: TxFailedCallback = (result) => {
    isFunction(onFailed) && onFailed(result)

    const message: Message = isFunction(failedMessage)
      ? failedMessage(result)
      : failedMessage

    message && showErrorMessage(message)
  }

  const onSuccessHandler = async (result: SubmittableResult) => {

    if (!result || !result.status) {
      return
    }

    const { status } = result
    // TODO show antd success notification here
    if (status.isFinalized || status.isInBlock) {
      setIsSending(false)
      await unsubscribe()

      const blockHash = status.isFinalized
        ? status.asFinalized
        : status.asInBlock

      log.debug(`✅ Tx finalized. Block hash: ${blockHash.toString()}`)

      result.events
        .filter(({ event: { section } }): boolean => section === 'system')
        .forEach(({ event: { method } }): void => {
          if (method === 'ExtrinsicSuccess') {
            doOnSuccess(result)
          } else if (method === 'ExtrinsicFailed') {
            doOnFailed(result)
          }
        })
    } else if (result.isError) {
      doOnFailed(result)
    } else {
      log.debug(`⏱ Current tx status: ${status.type}`)
    }

  }

  const onFailedHandler = (err: Error) => {
    setIsSending(false)

    if (err) {
      const errMsg = `Tx failed: ${err.toString()}`
      log.debug(`❌ ${errMsg}`)
      showErrorMessage(errMsg)
    }

    doOnFailed(null)
  }

  const sendSignedTx = async () => {
    if (!accountId) {
      throw new Error('No account id provided')
    }

    const account = await getAccount()
    const extrinsic = await getExtrinsic()

    try {
      unsub = await extrinsic.signAndSend(account, { nonce }, onSuccessHandler)
      incClientNonce()
      waitMessage.open()
    } catch (err) {
      onFailedHandler(err)
    }
  }

  const sendUnsignedTx = async () => {
    const extrinsic = await getExtrinsic()

    try {
      unsub = await extrinsic.send(onSuccessHandler)
      waitMessage.open()
    } catch (err) {
      onFailedHandler(err)
    }
  }

  const unsubscribe = () => {
    if (unsub) {
      waitMessage.close()
      unsub()
    }
  }

  // TODO can optimize this fn by wrapping it with useCallback. See TxButton from Apps.
  const sendTx = async () => {
    unsubscribe()

    if (isFunction(onValidate) && !(await onValidate())) {
      log.warn('Cannot send a tx because onValidate() returned false')
      return
    }

    isFunction(onClick) && onClick()

    const txType = unsigned ? 'unsigned' : 'signed'
    log.debug(`Sending ${txType} tx...`)

    withSpinner && setIsSending(true)

    if (unsigned) {
      sendUnsignedTx()
    } else {
      sendSignedTx()
    }
  }

  const isDisabled =
    disabled ||
    isSending ||
    isEmptyStr(tx)

  return (
    <Component
      {...antdProps}
      onClick={() => {
        if (isAuthRequired) {
          openSignInModal('AuthRequired')
          return setIsSending(false)
        }

        sendTx()
      }}
      disabled={isDisabled}
      loading={withSpinner && isSending}
    >{buttonLabel}</Component>
  )
}

export default React.memo(TxButton)
