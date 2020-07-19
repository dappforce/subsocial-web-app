import React, { useState } from 'react'
import Button, { ButtonProps } from 'antd/lib/button'

import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { SubmittableResult } from '@polkadot/api'
import { AddressOrPair } from '@polkadot/api/submittable/types'
import { web3FromSource } from '@polkadot/extension-dapp'
import { isFunction } from '@polkadot/util'

import { newLogger, isEmptyStr, nonEmptyArr, nonEmptyStr } from '@subsocial/utils'
import { useSubstrate } from '.'
import useToggle from './useToggle'
import { Message, showSuccessMessage, showErrorMessage } from '../utils/Message'
import { useAuth } from '../auth/AuthContext'

const log = newLogger('TxButton')

const logStatus = (status: string) => log.debug(status)

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
  title?: string,
  unsigned?: boolean
  onValidate?: () => boolean | Promise<boolean>
  onClick?: () => void
  onSuccess?: TxCallback
  onFailed?: TxFailedCallback
  successMessage?: SuccessMessage
  failedMessage?: FailedMessage
  withSpinner?: boolean,
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
  const [ unsub, setUnsub ] = useState<() => void>()
  const [ isSending, , setIsSending ] = useToggle(false)
  const { openSignInModal, state: { isSteps: { isTokens } } } = useAuth()

  const isAuthRequired = !accountId || !isTokens
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

  const onSuccessHandler = (result: SubmittableResult) => {
    setIsSending(false)

    if (!result || !result.status) {
      return
    }

    const { status } = result
    status.isFinalized
      ? logStatus(`✅ Tx finalized. Block hash: ${status.asFinalized.toString()}`)
      : logStatus(`⏱ Current tx status: ${status.type}`)
    ;

    // TODO show antd success notification here

    if (result.status.isFinalized || result.status.isInBlock) {
      unsubscribe()

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
    }
  }

  const onFailedHandler = (err: Error) => {
    setIsSending(false)
    err && logStatus(`❌ Tx failed: ${err.toString()}`)
    doOnFailed(null)
  }

  const sendSignedTx = async () => {
    if (!accountId) {
      throw new Error('No account id provided')
    }

    const account = await getAccount()
    const extrinsic = await getExtrinsic()

    const unsub = await extrinsic
      .signAndSend(account, onSuccessHandler)
      .catch(onFailedHandler)

    setUnsub(() => unsub)
  }

  const sendUnsignedTx = async () => {
    const extrinsic = await getExtrinsic()

    const unsub = await extrinsic
      .send(onSuccessHandler)
      .catch(onFailedHandler)

    setUnsub(() => unsub)
  }

  const unsubscribe = () => {
    if (unsub) {
      unsub()
      setUnsub(undefined)
    }
  }

  // TODO can optimize this fn by wrapping it with useCallback. See TxButton from Apps.
  const sendTx = async () => {
    unsubscribe()

    if (isFunction(onValidate) && !(await onValidate())) {
      log.info('Cannot send a tx because onValidate() returned false')
      return
    }

    isFunction(onClick) && onClick()

    const txType = unsigned ? 'unsigned' : 'signed'
    logStatus(`Sending ${txType} tx...`)

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
