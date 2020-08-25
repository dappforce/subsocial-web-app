import React, { useState } from 'react'
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { UploadChangeParam, DraggerProps } from 'antd/lib/upload';
import ImgCrop from 'antd-img-crop';
import { saveFile } from '../utils/OffchainUtils';
import useSubsocialEffect from '../api/useSubsocialEffect';

function getBase64 (img: File | Blob, callback: (res: string | ArrayBuffer | null) => void) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload (file: File | Blob) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file.');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB.');
  }
  return isJpgOrPng && isLt2M;
}

type DragDropProps = Omit<DraggerProps, 'onChange'> & {
  onChange: (file: string) => void,
  img?: string
}

export const UploadImg = ({ onChange, img }: DragDropProps) => {
  const [ loading, setLoading ] = useState(false)
  const [ imgUrl, setUrl ] = useState(img)
  const [ cid, setCid ] = useState('')

  useSubsocialEffect(({ ipfs }) => {
    ipfs.getContent(cid).then((data: any) => {
      if (data) {
        console.log('DATA:', data)
        const img = `data:${data.mimetype};base64,${data.image}`
        setUrl(img)
        setLoading(true)
      }
    })
  }, [ cid ])

  const handleChange = async (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const img = info.file.originFileObj
      const cid = img && await saveFile(img)
      console.log('Cid of img:', cid)
      setCid(cid)
      onChange(cid)
      img && getBase64(img, imageUrl => {
        const url = imageUrl?.toString()
        console.log(url)
      });
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  return (
    <ImgCrop rotate>
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {imgUrl ? <img src={imgUrl} alt="uploaded image" style={{ width: '100%' }} /> : uploadButton}
      </Upload>
    </ImgCrop>
  );
}
