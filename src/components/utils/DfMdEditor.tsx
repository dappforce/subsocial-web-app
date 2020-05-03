import React from 'react'
import SimpleMDEReact, { SimpleMDEEditorProps } from 'react-simplemde-editor'

type Props = Omit<SimpleMDEEditorProps, 'onChange'> & {
  onChange?: (value: string) => void | any
}

export const DfMdEditor = (props: Props) => {
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

export default DfMdEditor
