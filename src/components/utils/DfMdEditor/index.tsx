import React from 'react'
import dynamic from 'next/dynamic'
import { MdEditorProps } from './types'
import { isClientSide } from '..'

const ClientMdEditor = dynamic(() => import('./client'), { ssr: false })

/**
 * MdEditor is based on CodeMirror that is a large dependency: 55 KB (gzipped).
 * Do not use MdEditor on server side, becasue we don't need it there.
 * That's why we import editor dynamically only on the client side.
 */
function Inner (props: MdEditorProps) {
  return isClientSide()
    ? <ClientMdEditor {...props} />
    : null
}

export default React.memo(Inner)
