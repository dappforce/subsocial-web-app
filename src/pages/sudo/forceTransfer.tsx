import React, { useState } from 'react'
import { Input, Form, Button } from 'antd'
import { OnlySudo } from 'src/components/auth/OnlySudo'
import { HeadMeta } from 'src/components/utils/HeadMeta'
import { Section } from 'src/components/utils/Section'
import { DfForm, DfFormButtons } from 'src/components/forms'
import { showErrorMessage, showSuccessMessage } from 'src/components/utils/Message'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { Balance } from '@polkadot/types/interfaces'
import { nonEmptyStr, pluralize } from '@subsocial/utils'
import { formatBalance } from '@polkadot/util'
import { FormatBalance } from 'src/components/profiles/address-views/utils/Balance'
import BN from 'bn.js'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';

type FormValues = Partial<{
  accounts: string
}>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type FormProps = {}

type Account = string

type AccountWithBalance = {
  account: Account
  balance: Balance
}

function RenderBalances ({ balances, title }: {
  balances: AccountWithBalance[],
  title: React.ReactNode
}) {
  return balances.length ? <>
    <h3>{title}</h3>
    <ol>
      {balances.map((x, i) => {
        const css = x.balance.gtn(0) ? 'text-success' : 'text-danger'
        return <li key={x.account.toString()}>
          <code className={css + ' mr-3'}>{x.account.toString()} </code>
          <FormatBalance value={x.balance} />
        </li>
      })}
    </ol>
  </> : null
}

function InnerForm (props: FormProps) {
  const [ form ] = Form.useForm()
  const [ accounts, setAccounts ] = useState<Account[]>([])
  const [ positiveBalances, setPositiveBalances ] = useState<AccountWithBalance[]>([])
  const [ zeroBalances, setZeroBalances ] = useState<AccountWithBalance[]>([])
  const [ batchTx, setBatchTx ] = useState<SubmittableExtrinsic>()
  const [ freeTokensPerAccount, setFreeTokensPerAccount ] = useState<BN>(new BN(0))

  useSubsocialEffect(({ substrate }) => {
    let unsub: (() => void) | undefined;
    let isSubscribe = true

    const sub = async () => {
      const api = await substrate.api;
      const sudo = await api.query.sudo.key()

      // WARN: do not move this code to global level: here we need Substrate API ready.
      const { decimals } = formatBalance.getDefaults()
      setFreeTokensPerAccount(new BN(2 * 10 ** decimals))

      unsub = await api.query.system.account.multi(accounts, (res) => {
        const usedAccs = new Set<string>()
        const positiveBalances: AccountWithBalance[] = []
        const zeroBalances: AccountWithBalance[] = []

        res.forEach((r, i) => {
          const account = accounts[i]
          if (!usedAccs.has(account)) {
            const balance = (r as any).data.free as Balance
            const item = { account, balance }
            if (balance.gtn(0)) {
              positiveBalances.push(item)
            } else {
              zeroBalances.push(item)
            }
            usedAccs.add(account)
          }
        })

        if (zeroBalances.length) {
          Promise.all(zeroBalances.map(x => {
            return api.tx.balances.forceTransfer(sudo, x.account, freeTokensPerAccount)
          })).then((forceTransferTxs) => {
            setBatchTx(api.tx.utility.batch(forceTransferTxs))
          })
        }

        if (isSubscribe) {
          setPositiveBalances(positiveBalances)
          setZeroBalances(zeroBalances)
        }
      })
    }

    isSubscribe && sub().catch(err => console.error('Failed load balances %o', err))

    return () => {
      unsub && unsub()
      isSubscribe = false
    }
  }, [ accounts.join('') ])

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const hasZeroBalances = zeroBalances.length > 0

  return <div {...props}>
    <DfForm form={form}>

      <Form.Item
        label='Free tokens per account'
      >
        <FormatBalance value={freeTokensPerAccount} />
      </Form.Item>

      <Form.Item
        name={fieldName('accounts')}
        label='Accounts'
      >
        <Input.TextArea
          placeholder='Account address per line'
          rows={6}
          style={{
            fontFamily: 'monospace',
            fontSize: '1rem'
          }}
        />
      </Form.Item>

      <Form.Item label=' '>
        <Button onClick={() => {
          const accsLines = getFieldValues().accounts || ''
          const accs = accsLines
            .split(/(\r\n|\r|\n)/)
            .filter(nonEmptyStr)
            .map(x => x.trim())

          console.log({ accs })

          setAccounts(accs)
        }}>Read balances</Button>
      </Form.Item>

      {hasZeroBalances && <DfFormButtons
        form={form}
        withReset={false}
        txProps={{
          disabled: !hasZeroBalances,
          label: <span>Send {formatBalance(freeTokensPerAccount)} to {pluralize(zeroBalances.length, 'account')}</span>,
          tx: 'sudo.sudo',
          params: [ batchTx ],
          onSuccess: () => {
            showSuccessMessage('Tokens sent')
          },
          onFailed: () => {
            showErrorMessage('Failed to send tokens')
          }
        }}
      />}
    </DfForm>

    <RenderBalances balances={zeroBalances} title='Zero balances' />
    <RenderBalances balances={positiveBalances} title='Positive balances' />
  </div>
}

export function Page (props: FormProps) {
  const title = 'Sudo / forceTransfer'
  return <OnlySudo>
    <HeadMeta title={title} />
    <Section className='EditEntityBox' title={title}>
      <InnerForm {...props} />
    </Section>
  </OnlySudo>
}

export default Page
