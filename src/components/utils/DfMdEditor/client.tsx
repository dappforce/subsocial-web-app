import React from 'react'
import SimpleMDEReact from 'react-simplemde-editor'
import { AutoSaveType, MdEditorProps } from './types'
import store from 'store'


const getAutoSaveStorageKey = (id: AutoSaveType) => `smde_${id}`
/** Get auto saved content of editor from the local storage. */
const getAutoSavedContent = (id?: AutoSaveType): string | undefined => {
  return id ? store.get(getAutoSaveStorageKey(id)) : undefined
}

export const clearAutoSavedContent = (id: AutoSaveType) => store.remove(getAutoSaveStorageKey(id))

const AUTO_SAVE_INTERVAL_MILLIS = 5000

const MdEditor = ({
  className,
  options = {},
  events = {},
  onChange = () => {},
  value,
  autoSaveId,
  autoSaveIntervalMillis = AUTO_SAVE_INTERVAL_MILLIS,
  ...otherProps
}: MdEditorProps) => {
  const { toolbar = true, ...otherOptions } = options

  const classToolbar = !toolbar && 'hideToolbar'

  const autosave = autoSaveId
    ? {
      enabled: true,
      uniqueId: autoSaveId,
      delay: autoSaveIntervalMillis
    }
    : undefined

  const newOptions = {
    previewClass: 'markdown-body',
    autosave,
    ...otherOptions
  }

  return <SimpleMDEReact
    className={`DfMdEditor ${classToolbar} ${className}`}
    value={value || getAutoSavedContent(autoSaveId)}
    events={events}
    onChange={onChange}
    options={newOptions}
    {...otherProps}
  />
}

export default MdEditor
