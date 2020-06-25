import React, { useState } from 'react'
import Button, { ButtonProps } from 'antd/lib/button'

import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { SubmittableResult } from '@polkadot/api'
import { AddressOrPair } from '@polkadot/api/submittable/types'
import { web3FromSource } from '@polkadot/extension-dapp'

import { newLogger, isEmptyStr, nonEmptyArr, nonEmptyStr } from '@subsocial/utils'
import { useSubstrate } from '.'
import useToggle from './useToggle'

const log = newLogger('TxButton')

function isFunction (maybeFn?: any): maybeFn is Function {
  return typeof maybeFn === 'function'
}

export type GetTxParamsFn = () => any[]

export type GetTxParamsAsyncFn = () => Promise<any[]>

export type TxCallback = (status: SubmittableResult) => void

export type TxFailedCallback = (status: SubmittableResult | null) => void

const DefaultStatusLogger = (status: string) => log.debug(status)

export type TxButtonProps = Omit<ButtonProps, 'onClick'> & {
  accountId?: AddressOrPair
  tx?: string
  params?: any[] | GetTxParamsFn | GetTxParamsAsyncFn
  label?: React.ReactNode

  // TODO replace with using 'disabled'
  /** Deprecated. Use `disabled`. */
  isDisabled?: boolean

  isUnsigned?: boolean
  onFailed?: TxFailedCallback
  onSuccess?: TxCallback
  withSpinner?: boolean

  // TODO maybe delete
  logStatus?: (status: string) => void
}

export function TxButton ({
  accountId,
  tx,
  params,
  label,
  disabled,
  isDisabled,
  isUnsigned,
  onFailed,
  onSuccess,
  withSpinner,
  logStatus = DefaultStatusLogger,

  children,
  ...antdProps
}: TxButtonProps) {

  const { api, keyring, keyringState } = useSubstrate()
  const [ unsub, setUnsub ] = useState<() => void>()
  const [ isSending, , setIsSending ] = useToggle(false)

  const buttonLabel = label || children
  const needsAccount = !isUnsigned && !accountId

  if (!api || !api.isReady) {
    return (
      <Button
        {...antdProps}
        disabled={true}
        loading={true}
      >{buttonLabel}</Button>
    )
  }

  // TODO use Auth here. See in AppsTxButton component:
  // const { openSignInModal, state: { isSteps: { isTokens } } } = useAuth()

  // TODO used for debug
  // let b: TxButtonProps = {} as TxButtonProps
  // b.disabled

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
      const injected = await web3FromSource(source)
      fromAccount = address
      api.setSigner(injected.signer)
    }

    return fromAccount
  }

  const getExtrinsic = async (): Promise<SubmittableExtrinsic> => {
    const [ pallet, method ] = (tx || '').split('.')

    // log.debug('Substrate api:', api)
    // log.debug('Account id:', accountId)

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
          if (isFunction(onFailed) && method === 'ExtrinsicFailed') {
            onFailed(result)
          } else if (isFunction(onSuccess) && method === 'ExtrinsicSuccess') {
            onSuccess(result)
          }
        })
    } else if (result.isError && isFunction(onFailed)) {
      onFailed(result)
    }
  }

  const onFailedHandler = (err: Error) => {
    setIsSending(false)
    err && logStatus(`❌ Tx failed: ${err.toString()}`)

    // TODO show antd error notification here

    isFunction(onFailed) && onFailed(null)
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

    const txType = isUnsigned ? 'unsigned' : 'signed'
    logStatus(`Sending ${txType} tx...`)

    withSpinner && setIsSending(true)

    if (isUnsigned) {
      sendUnsignedTx()
    } else {
      sendSignedTx()
    }
  }

  const _disabled =
    disabled ||
    isDisabled ||
    isSending ||
    needsAccount ||
    isEmptyStr(tx)

  return (
    <Button
      {...antdProps}
      onClick={sendTx}
      disabled={_disabled}
      loading={isSending}
    >{buttonLabel}</Button>
  )
}

export default React.memo(TxButton)
