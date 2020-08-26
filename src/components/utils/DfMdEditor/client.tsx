import React from 'react'
import SimpleMDEReact, { SimpleMDEEditorProps } from 'react-simplemde-editor'
import { MdEditorProps } from './types'

type Props =
  Omit<SimpleMDEEditorProps, 'onChange'>
  & MdEditorProps

const MdEditor = ({
  className,
  options = {},
  events = {},
  onChange = () => {},
  ...otherProps
}: Props) => {

  return <SimpleMDEReact
    className={`DfMdEditor ${className}`}
    options={{ previewClass: 'markdown-body', ...options }}
    events={events}
    onChange={onChange}
    {...otherProps}
  />
}

export default MdEditor
