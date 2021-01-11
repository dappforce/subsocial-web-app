import React from 'react'
import SimpleMDEReact from 'react-simplemde-editor'
import { MdEditorProps } from './types'

const MdEditor = ({
  className,
  options = {},
  events = {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange = () => {},
  ...otherProps
}: MdEditorProps) => {
  const { toolbar = true, ...otherOptions } = options

  const classToolbar = !toolbar && 'hideToolbar'

  return <SimpleMDEReact
    className={`DfMdEditor ${classToolbar} ${className}`}
    options={{ previewClass: 'markdown-body', ...otherOptions }}
    events={events}
    onChange={onChange}
    {...otherProps}
  />
}

export default MdEditor
