import React from 'react'
import HtmlPage from 'src/components/utils/HtmlPage'
import html from './terms.md'

export default React.memo(() => <HtmlPage html={html} title='Terms of Use' />)
