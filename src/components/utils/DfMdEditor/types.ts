import { SimpleMDEEditorProps } from 'react-simplemde-editor'

export type AutoSaveType = 'space' | 'post' | 'profile'

export type MdEditorProps = Omit<SimpleMDEEditorProps, 'onChange'> & {
  onChange?: (value: string) => any | void
  autoSaveId?: AutoSaveType
  autoSaveIntervalMillis?: number
}
