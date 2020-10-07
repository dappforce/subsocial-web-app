import React, { useState, useCallback } from 'react'
import { Upload } from 'antd';
import { LoadingOutlined, CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import { UploadChangeParam, DraggerProps } from 'antd/lib/upload';
import ImgCrop from 'antd-img-crop';
import { showErrorMessage } from '../utils/Message';
import { resolveIpfsUrl } from 'src/ipfs';
import { DfBgImg } from '../utils/DfBgImg';
import styles from './index.module.sass'
import { newLogger } from '@subsocial/utils';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { BareProps, FVoid } from '../utils/types';

const log = newLogger('Uploader')

type UploadProps = Omit<DraggerProps, 'onChange'> & {
  onChange: (url?: string) => void,
  img?: string
}

type ImagePreviewProps = {
  imgUrl: string,
  onRemove: FVoid
}

type InnerUploadProps = UploadProps & {
  ImagePreview: React.FC<ImagePreviewProps>
}

const setError = (err: string) => {
  showErrorMessage(err);
}

type RemoveIconProps = BareProps & {
  onClick: FVoid
}

const RemoveIcon = (props: RemoveIconProps) => <div title='Remove image' {...props}>
  <DeleteOutlined />
</div>

export const InnerUploadImg = ({ onChange, img, ImagePreview, ...props }: InnerUploadProps) => {
  const [ loading, setLoading ] = useState(false)
  const [ imgUrl, setUrl ] = useState(img)
  const { ipfs } = useSubsocialApi()

  const beforeUpload = useCallback((file: File | Blob) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      setError('You can only upload JPG/PNG file.')
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      setError('Image must smaller than 2MB.')
    }
    return isJpgOrPng && isLt2M;
  }, [])

  const handleChange = async (info: UploadChangeParam) => {
    console.log('onChange', info)
    if (info.file.status === 'uploading') {
      setLoading(true)
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const img = info.file.originFileObj

      if (img) {
        try {
          const cid = await ipfs.saveFile(img)
          onChange(cid)
          setUrl(cid)
        } catch (err) {
          const error = err?.response?.data?.message
          error && setError(err.response.data.message)
          log.error('Failed upload image:', err)
        }
      }

      setLoading(false)
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <CameraOutlined />}
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  return (
    imgUrl ? <ImagePreview imgUrl={resolveIpfsUrl(imgUrl)} onRemove={() => {
      onChange(undefined)
      setUrl(undefined)
    }} />
      : <Upload
        name="avatar"
        listType="picture-card"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        {...props}
      >
        {uploadButton}
      </Upload>
  );
}

export const UploadCover = (props: UploadProps) => {
  return <InnerUploadImg
    ImagePreview={({ imgUrl, onRemove }) => <div className='d-flex'>
      <img src={imgUrl} className='w-100' alt='cover' />
      <RemoveIcon className={styles.DfRemoveCover} onClick={onRemove} />
    </div>}
    className={styles.DfUploadCover}
    {...props}
  />
}

export const UploadAvatar = (props: UploadProps) => {
  return <ImgCrop rotate>
    <InnerUploadImg
      ImagePreview={({ imgUrl, onRemove }) => <div className='d-flex'>
        <DfBgImg className='DfAvatar' size={100} src={imgUrl} style={{ border: '1px solid #ddd' }} rounded/>
        <RemoveIcon className={styles.DfRemoveIcon} onClick={onRemove} />
      </div>}
      className={styles.DfUploadAvatar}
      {...props}
    />
  </ImgCrop>
}
