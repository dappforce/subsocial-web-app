import React, { useState, useEffect } from 'react';

type Props = {
  id: string,
  file: string
}

const Gist = (props: Props) => {

  useEffect(() => {
    _updateIframeContent()
  }, [props])

  const { id, file } = props

  const [ iframe, setIframe ] = useState<HTMLIFrameElement | null>(null)

  const _defineUrl = () => {
    
    const fileArg = file ? `?file=${file}` : '';

    return `https://gist.github.com/${id}.js${fileArg}`;
  }

  const _updateIframeContent = () => {

    let doc
    if (iframe?.contentDocument) doc = iframe.contentDocument;
    else if (iframe?.contentWindow) doc = iframe.contentWindow.document;

    const gistLink = _defineUrl()
    const gistScript = `<script type="text/javascript" src="${gistLink}"></script>`;
    const styles = '<style>*{font-size:12px;} .file{height: 300px;}</style>';
    const elementId = file ? `gist-${id}-${file}` : `gist-${id}`;
    const resizeScript = `onload="parent.document.getElementById('${elementId}').style.height=document.body.scrollHeight + 'px'"`;
    const iframeHtml = `<html><head><base target="_parent">${styles}</head><body ${resizeScript}>${gistScript}</body></html>`;

    doc?.open();
    doc?.writeln(iframeHtml);
    doc?.close();
  }

  return (
    <iframe
      ref={(n: HTMLIFrameElement | null) => setIframe(n)}
      width="100%"
      frameBorder={0}
      id={file ? `gist-${id}-${file}` : `gist-${id}`}
    />
  );
  
}

export default Gist;