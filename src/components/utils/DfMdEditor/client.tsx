import React, { useEffect } from 'react'
import SimpleMDEReact from 'react-simplemde-editor'
import { AutoSaveId, MdEditorProps } from './types'
import store from 'store'
import { nonEmptyStr } from '@subsocial/utils'

const getStoreKey = (id: AutoSaveId) => `smde_${id}`

/** Get auto saved content for MD editor from the browser's local storage. */
const getAutoSavedContent = (id?: AutoSaveId): string | undefined => {
  return id ? store.get(getStoreKey(id)) : undefined
}

export const clearAutoSavedContent = (id: AutoSaveId) =>
  store.remove(getStoreKey(id))

const AUTO_SAVE_INTERVAL_MILLIS = 5000

const MdEditor = ({
  className,
  options = {},
  events = {},
  onChange = () => void(0),
  value,
  autoSaveId,
  autoSaveIntervalMillis = AUTO_SAVE_INTERVAL_MILLIS,
  ...otherProps
}: MdEditorProps) => {
  const { toolbar = true, ...otherOptions } = options

  const autosavedContent = getAutoSavedContent(autoSaveId)

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

  useEffect(() => {
    if (autosave && nonEmptyStr(autosavedContent)) {
      // Need to trigger onChange event to notify a wrapping Ant D. form
      // that this editor received a value from local storage.
      onChange(autosavedContent)
    }
  }, [])

  return <SimpleMDEReact
    className={`DfMdEditor ${classToolbar} ${className}`}
    value={value || autosavedContent}
    events={events}
    onChange={onChange}
    options={newOptions}
    {...otherProps}
  />
}

export default MdEditor
