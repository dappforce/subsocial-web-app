import styles from './AntForms.module.sass'

import React from 'react'
import dynamic from 'next/dynamic'
import { Form, Button } from 'antd'
import { FormProps, FormItemProps, FormInstance } from 'antd/lib/form'
import { TxButtonProps } from 'src/components/substrate/SubstrateTxButton'

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

const labelLen = 6
const fieldLen = 24 - labelLen

const commonFormProps: FormProps = {
  size: 'large',
  labelCol: { span: labelLen },
  wrapperCol: { span: fieldLen }
}

const commonFormButtonsProps: FormItemProps = {
  wrapperCol: { offset: labelLen, span: fieldLen }
}

const commonFormTxButtonProps: TxButtonProps = {
  type: 'primary',
  size: commonFormProps.size
}

export const DfForm = (props: FormProps) =>
  <Form {...commonFormProps} {...props} className={styles.DfForm}>
    {props.children}
  </Form>

type DfFormTxButtonProps = Omit<TxButtonProps, 'form'> & {
  form: FormInstance
}

type DfFormButtonsProps = FormItemProps & {
  form: FormInstance
  withReset?: boolean
  txProps: TxButtonProps
}

export const DfFormButtons = ({
  form,
  withReset = true,
  txProps,
  ...props
}: DfFormButtonsProps) =>
  <Form.Item {...commonFormButtonsProps} {...props}>
    <DfFormTxButton form={form} {...txProps} />
    {withReset &&
      <Button onClick={() => form.resetFields()}>
        Reset form
      </Button>
    }
  </Form.Item>

export const shouldSendTx = async (form: FormInstance) => {
  try {
    await form.validateFields()
    return form.isFieldsTouched()
  } catch (err) {
    // Form is invalid
    return false
  }
}

export const DfFormTxButton = ({ form, ...props }: DfFormTxButtonProps) =>
  <TxButton
    {...commonFormTxButtonProps}
    {...props}
    onValidate={() => shouldSendTx(form)}
  />
