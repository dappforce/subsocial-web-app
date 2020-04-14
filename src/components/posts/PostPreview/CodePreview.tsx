import React from 'react'
import { CodeBlockValue, BlockValueKind } from '../../types'
import AceEditor from 'react-ace'
import 'brace/mode/javascript'
import 'brace/mode/typescript'
import 'brace/mode/scss'
import 'brace/mode/html'
import 'brace/mode/powershell'
import 'brace/mode/rust'
import 'brace/theme/github'

type Props = {
  block: BlockValueKind
}

const CodePreview = (props: Props) => {
  const { block: x } = props
  const { lang } = x as CodeBlockValue

  if (typeof window === 'undefined') {
    return <pre>{x.data}</pre>
  }

  return <AceEditor
    mode={lang || 'javascript'}
    theme="github"
    value={x.data}
    name="ace-editor-readonly"
    readOnly={true}
    editorProps={{ $blockScrolling: true }}
    width='100%'
    className={'AceEditor'}
    minLines={1}
    maxLines={9}
  />
}

export default CodePreview