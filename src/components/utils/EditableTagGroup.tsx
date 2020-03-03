import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { Tag, Input, Tooltip, Icon, AutoComplete } from 'antd';
import { FormikProps, ErrorMessage } from 'formik';
import { PostContent } from '../types';
import { SelectValue } from 'antd/lib/select';
import { nonEmptyStr } from '.';

interface OtherProps {
  tagsData: string[],
  name?: keyof FormValues,
  label?: string
}

type FormValues = PostContent;

const EditableTagGroup = (props: OtherProps & FormikProps<FormValues>) => {
  const { setFieldValue, values, tagsData, label, name, touched, errors } = props
  const {
    tags
  } = values;

  const hasError = name && touched[name] && errors[name];

  const [ inputVisible, setInputVisible ] = useState(false)
  const [ inputValue, setInputValue ] = useState('')

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setFieldValue(name as string, newTags)
  };

  const showInput = () => {
    setInputValue('')
    setInputVisible(true);
  };

  const handleInputChange = (e: SelectValue) => {
    setInputValue(e.toString());
  };

  const handleInputConfirm = () => {
    let newTags = [ '' ]
    if (inputValue && tags.indexOf(inputValue) === -1) {
      newTags = [ ...tags, inputValue ];
      setFieldValue(name as string, newTags)
      setInputVisible(false)
    }
  };

  return (
    <div className={`ui--Labelled field ${hasError ? 'error' : ''}`}>
      <label htmlFor={name as string}>{nonEmptyStr(label) && label + ':'}</label>
      <div className='ui--Labelled-content'>
        {tags.map((tag) => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag key={tag} closable={true} onClose={() => handleClose(tag)}>
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}
        {inputVisible && (
          <AutoComplete
            autoFocus
            size="small"
            style={{ width: 78 }}
            onChange={handleInputChange}
            onBlur={handleInputConfirm}
            value={inputValue}
            dataSource={tagsData}
            filterOption={(inputValue, option) =>
              option.props.children?.toString().toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
          >
            <Input onPressEnter={handleInputConfirm} />
          </AutoComplete>
        )}
        {!inputVisible && (
          <Tag onClick={showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
            <Icon type="plus" /> New Tag
          </Tag>
        )}
        {name && <ErrorMessage name={name as string} component='div' className='ui pointing red label' />}
      </div>
    </div>
  );
}

export default EditableTagGroup
