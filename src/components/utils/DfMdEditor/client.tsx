import React from 'react'
import SimpleMDEReact, { SimpleMDEEditorProps } from 'react-simplemde-editor'
import { MdEditorProps } from './types'

type Props =
  Omit<SimpleMDEEditorProps, 'onChange'>
  & MdEditorProps

const MdEditor = (props: Props) => {
  const {
    className,
    options = {},
    events = {},
    onChange = () => {},
    ...otherProps
  } = props

  return <SimpleMDEReact
    className={`${className} DfMdEditor--preview`}
    options={{ previewClass: 'markdown-body', ...options }}
    events={events}
    onChange={onChange}
    {...otherProps}
  />
}

export default MdEditor
