import { SimpleMDEEditorProps } from 'react-simplemde-editor'

export type AutoSaveId = 'space' | 'post' | 'profile'

export type MdEditorProps = Omit<SimpleMDEEditorProps, 'onChange'> & {
  onChange?: (value: string) => any | void
  autoSaveId?: AutoSaveId
  autoSaveIntervalMillis?: number
}
