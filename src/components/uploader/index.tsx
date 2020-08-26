import React, { useState, useCallback } from 'react'
import { Upload } from 'antd';
import { LoadingOutlined, CameraOutlined } from '@ant-design/icons';
import { UploadChangeParam, DraggerProps } from 'antd/lib/upload';
import ImgCrop from 'antd-img-crop';
import { showErrorMessage } from '../utils/Message';
import { resolveIpfsUrl } from 'src/ipfs';
import { DfBgImg } from '../utils/DfBgImg';
import styles from './index.module.sass'
import { newLogger } from '@subsocial/utils';
import { useSubsocialApi } from '../utils/SubsocialApiContext';

const log = newLogger('Uploader')

type UploadProps = Omit<DraggerProps, 'onChange'> & {
  onChange: (url: string) => void,
  img?: string
}

type InnerUploadProps = UploadProps & {
  renderImagePreview: (url: string) => JSX.Element
}

const setError = (err: string) => {
  showErrorMessage(err);
}

export const InnerUploadImg = ({ onChange, img, renderImagePreview, ...props }: InnerUploadProps) => {
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

      setLoading(true)

    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <CameraOutlined />}
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  return (
    <Upload
      name="avatar"
      listType="picture-card"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      {...props}
    >
      {imgUrl ? renderImagePreview(resolveIpfsUrl(imgUrl)) : uploadButton}
    </Upload>
  );
}

export const UploadCover = (props: UploadProps) => {
  return <InnerUploadImg
    renderImagePreview={(url) => <img src={url} className='w-100' alt='cover' />}
    className={styles.DfUploadCover}
    {...props}
  />
}

export const UploadAvatar = (props: UploadProps) => {
  return <ImgCrop rotate>
    <InnerUploadImg
      renderImagePreview={(url) => <DfBgImg className='DfAvatar' size={100} src={url} style={{ border: '1px solid #ddd' }} rounded/>}
      className={styles.DfUploadAvatar}
      {...props}
    />
  </ImgCrop>
}
