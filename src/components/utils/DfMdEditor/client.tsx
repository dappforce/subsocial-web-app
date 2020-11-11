import React from 'react'
import SimpleMDEReact from 'react-simplemde-editor'
import { MdEditorProps } from './types'
import store from 'store'

const getSavedContent = (id?: string): string | undefined => {
  return id ? store.get(`smde_${id}`) : undefined
}

const DEFAULT_DELAY = 5000

const MdEditor = ({
  className,
  options = {},
  events = {},
  onChange = () => {},
  value,
  autoSaveId,
  delay = DEFAULT_DELAY,
  ...otherProps
}: MdEditorProps) => {
  const { toolbar = true, ...otherOptions } = options

  const classToolbar = !toolbar && 'hideToolbar'

  const autosave = autoSaveId
    ? {
      enabled: true,
      uniqueId: autoSaveId,
      delay
    }
    : undefined

  return <SimpleMDEReact
    className={`DfMdEditor ${classToolbar} ${className}`}
    options={{
      previewClass: 'markdown-body',
      autosave,
      ...otherOptions }}
    value={value || getSavedContent(autoSaveId)}
    events={events}
    onChange={onChange}
    {...otherProps}
  />
}

export default MdEditor
