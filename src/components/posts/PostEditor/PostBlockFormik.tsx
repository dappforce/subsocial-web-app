import React, { useState } from 'react'
import { BlockValueKind, CodeBlockValue, ImageBlockValue } from '../../types'
import SimpleMDEReact from 'react-simplemde-editor'
import { Field, ErrorMessage } from 'formik'
import { Dropdown, Menu, Icon } from 'antd'
import AceEditor from 'react-ace'
import 'brace/mode/javascript'
import 'brace/mode/typescript'
import 'brace/mode/scss'
import 'brace/mode/html'
import 'brace/mode/powershell'
import 'brace/mode/rust'
import 'brace/theme/github'
import { isMobile } from 'react-device-detect'
import SubMenu from 'antd/lib/menu/SubMenu'
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile, RcFile } from 'antd/lib/upload/interface';
import Dragger from 'antd/lib/upload/Dragger'
import { getImageFromIpfs } from 'src/components/utils'

type Props = {
  block: BlockValueKind
  index: number
  setFieldValue: (field: string, value: any) => void
  handleLinkChange: (block: BlockValueKind, name: string, value: string) => void
  handleImagePreviewChange: (block: ImageBlockValue, src: string) => void
  blockValues: BlockValueKind[]
  addMenu: (index?: number, onlyItems?: boolean, pos?: string) => JSX.Element[] | JSX.Element
}

const PostBlockFormik = (props: Props) => {
  const { block, index, setFieldValue, handleLinkChange, blockValues, addMenu, handleImagePreviewChange } = props

  const [ showImageInputs, setShowImageInputs ] = useState(true)
  const [ formPreviewImage, setFormPreviewImage ] = useState('')

  const langs = [
    { name: 'javascript', pretty: 'JavaScript' },
    { name: 'typescript', pretty: 'TypeScript' },
    { name: 'html', pretty: 'HTML' },
    { name: 'scss', pretty: 'CSS/SCSS' },
    { name: 'rust', pretty: 'Rust' },
    { name: 'powershell', pretty: 'PowerShell' }
  ]

  const MAX_PREVIEW_BLOCKS = 2
  const MAX_IMAGE_SIZE = 2 // MB

  const modesMenu = (id: number) => (
    <Menu>
      {langs.map((x) => (
        <Menu.Item key={x.name} onClick={() => handleAceMode(x.name, id)} >
          {x.pretty}
        </Menu.Item>
      ))}
    </Menu>
  )

  const handleAceMode = (mode: string, id: number) => {
    const bvIdx = blockValues.findIndex((x) => x.id === id)
    setFieldValue(`blockValues.${bvIdx}.lang`, mode)
  }

  const removeBlock = (id: number) => {
    const idx = blockValues.findIndex((x) => x.id === id)

    setFieldValue('blockValues', [
      ...blockValues.slice(0, idx),
      ...blockValues.slice(idx + 1)
    ])
  }

  const changeBlockPosition = (order: number, index: number) => {

    const newBlocksOrder = [ ...blockValues ]
    newBlocksOrder[index] = blockValues[index + order]
    newBlocksOrder[index + order] = blockValues[index]

    setFieldValue('blockValues', newBlocksOrder)
  }

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      console.log('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < MAX_IMAGE_SIZE;
    if (!isLt2M) {
      console.log('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  }

  const handleImage = async (info: UploadChangeParam<UploadFile<any>>) => {
    const { status } = info.file;
    if (status !== 'uploading') {
      setShowImageInputs(false)
    }
    if (status === 'done') {
      const response = info.file.response
      if (response.status === 'ok') {
        setFieldValue(`blockValues.${index}.hash`, response.hash)
        const src = await getImageFromIpfs(response.hash)
        handleImagePreviewChange(block as ImageBlockValue, src)
        setFormPreviewImage(src)
        setShowImageInputs(false)
      }
      
    } else if (status === 'error') {

      setShowImageInputs(true)
    }
  }

  const handleImgRemove = () => {
    setFormPreviewImage('')
    setFieldValue(`blockValues.${index}.hash`, undefined)
    setShowImageInputs(true)
  }

  let res

  switch (block.kind) {
    case 'text': {
      res = <SimpleMDEReact
        value={block.data}
        onChange={(data: string) => setFieldValue(`blockValues.${index}.data`, data)}
        className={`markdown-body`}
      />
      break
    }
    case 'link': {
      res = <Field
        type="text"
        name={`blockValues.${index}.data`}
        placeholder="Link"
        value={block.data}
        onChange={(e: React.FormEvent<HTMLInputElement>) => handleLinkChange(block, `blockValues.${index}.data`, e.currentTarget.value)}
      />
      break
    }
    case 'image': {
      res = showImageInputs
      ? <div className='ImageBlockWrapper'>
          <Field
            type="text"
            name={`blockValues.${index}.data`}
            placeholder="Image link"
            value={block.data}
            onChange={(e: React.FormEvent<HTMLInputElement>) => setFieldValue(`blockValues.${index}.data`, e.currentTarget.value)}
          />
          <div className='ImageUploadDivider'>Or</div>
          <Dragger 
            name='picture'
            multiple={false}
            action='http://127.0.0.1:3001/offchain/upload'
            onChange={(info: UploadChangeParam<UploadFile<any>>) => handleImage(info)}
            beforeUpload={beforeUpload}
            showUploadList={false}
            className='Dragger'
          >
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
          </Dragger>
        </div>
      : <div className='imgFormPreviewWrapper'>
        <Icon type="delete" className='removeImgIcon' onClick={handleImgRemove} />
        <img src={formPreviewImage} />
      </div>
      break
    }
    case 'video': {
      res = <Field
        type="text"
        name={`blockValues.${index}.data`}
        placeholder="Video link"
        value={block.data}
        onChange={(e: React.FormEvent<HTMLInputElement>) => handleLinkChange(block, `blockValues.${index}.data`, e.currentTarget.value)}
      />
      break
    }
    case 'code': {
      const { lang } = block as CodeBlockValue
      const pretty = langs.find((x) => x.name === lang)?.pretty
      res = <div className='EditPostAceEditor'>
        <Dropdown overlay={() => modesMenu(block.id)} className={'AceModeSelect'}>
          <a href='#' onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => e.preventDefault()}>
            <Icon type="down" /> Syntax: {pretty || 'JavaScript'}
          </a>
        </Dropdown>
        <AceEditor
          mode={lang || 'javascript'}
          theme="github"
          onChange={(value: string) => setFieldValue(`blockValues.${index}.data`, value)}
          value={block.data}
          name="ace-editor"
          editorProps={{ $blockScrolling: true }}
          className={'AceEditor'}
          width='100%'
          minLines={1}
          maxLines={9}
        />
      </div>
      break
    }
    default: {
      return null
    }
  }

  const maxBlockId = Math.max.apply(null, blockValues.map((x) => {
    return x.id
  }))

  let tempArray = 0
  blockValues.find((x) => {
    if (x.useOnPreview) tempArray++
  })
  const isPlaceForPreview = tempArray < MAX_PREVIEW_BLOCKS

  const handleUseOnPreview = (index: number, isPlaceForPreview: boolean) => {
    if (!isPlaceForPreview && !blockValues[index].useOnPreview) return
    setFieldValue(`blockValues.${index}.useOnPreview`, !blockValues[index].useOnPreview)
  }

  const mobileButtonsMenu = (
    <Menu className='MobileButtonsMenu'>
      <Icon type="plus-circle" className='AddBlockPlusIcon AddBefore' />
      <SubMenu title={`Add block before`} className='addBlockMenuButton'>
        {addMenu(index, true, 'before')}
      </SubMenu>
      <Icon type="plus-circle" className='AddBlockPlusIcon AddAfter' />
      <SubMenu title={`Add block after`} className='addBlockMenuButton'>
        {addMenu(index, true, 'after')}
      </SubMenu>
      <Menu.Item>
        <a onClick={() => handleUseOnPreview(index, isPlaceForPreview)} className={`SmallAntButton ${!isPlaceForPreview && 'off'} ${block.useOnPreview && 'on'}`}>
          <Icon type="crown" />
          {block.useOnPreview ? ' Remove from preview' : ' Use in preview'}
        </a>
      </Menu.Item>
      { index > 0 &&
      <Menu.Item><a className={'SmallAntButton'} onClick={() => changeBlockPosition(-1, index)} >
        <Icon type="up-circle" /> Move Up
      </a></Menu.Item> }
      { index < maxBlockId &&
        <Menu.Item><a className={'SmallAntButton'} onClick={() => changeBlockPosition(1, index)} >
          <Icon type="down-circle" /> Move Down
        </a></Menu.Item> }
      <Menu.Item>
        <a className={'SmallAntButton'} onClick={() => setFieldValue(`blockValues.${index}.hidden`, !block.hidden)}>
          {block.hidden
            ? <div><Icon type="eye" /> Show</div>
            : <div><Icon type="eye-invisible" /> Hide</div>
          }
        </a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => removeBlock(block.id)} className={'SmallAntButton'}>
          <Icon type="delete" /> Delete
        </a>
      </Menu.Item>
    </Menu>

  );

  const buttonsMenu = <div className="ButtonsForMobile">
    <Dropdown overlay={mobileButtonsMenu}>
      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        <Icon type="ellipsis" className="MenuDotsIcon" />
      </a>
    </Dropdown>
  </div>

  return <div className={`EditPostBlockWrapper ${isMobile ? 'MobileBlock' : ''}`} key={block.id} >
    {buttonsMenu}
    {block.useOnPreview && <div className='EditPostCrown'><Icon type="crown" /></div>}
    {res}
    <ErrorMessage name={`blockValues.${index}.data`} component='div' className='ui pointing red label' />
  </div>

}

export default PostBlockFormik