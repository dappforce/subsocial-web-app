import { SimpleMDEEditorProps } from 'react-simplemde-editor'

export type MdEditorProps = Omit<SimpleMDEEditorProps, 'onChange'> & {
  onChange?: (value: string) => any | void
}
