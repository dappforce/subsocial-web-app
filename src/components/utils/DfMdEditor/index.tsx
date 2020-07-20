import React from 'react'
import { Input } from 'antd'
import dynamic from 'next/dynamic'
import { MdEditorProps } from './types'
import { isClientSide } from '..'

const TextAreaStub = ({ onChange, ...props }: MdEditorProps) =>
  <Input.TextArea {...props} style={{ height: '120px' }} />

const ClientMdEditor = dynamic(
  () => import('./client'),
  { loading: () => <TextAreaStub />, ssr: false }
)

/**
 * MdEditor is based on CodeMirror that is a large dependency: 55 KB (gzipped).
 * Do not use MdEditor on server side, becasue we don't need it there.
 * That's why we import editor dynamically only on the client side.
 */
function Inner (props: MdEditorProps) {
  return isClientSide()
    ? <ClientMdEditor {...props} />
    : <TextAreaStub {...props} />
}

export default React.memo(Inner)
