import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { Tag, Input, Tooltip, Icon, AutoComplete } from 'antd';
import { ErrorMessage } from 'formik';
import { SelectValue } from 'antd/lib/select';
import { nonEmptyStr } from '.';

interface OtherProps {
  tagsData?: string[],
  name: string,
  label?: string,
  tags: string[],
  setFieldValue: (a: string, b: string[]) => void,
  touched: any,
  errors: any
}

const EditableTagGroup = (props: OtherProps) => {
  const { setFieldValue, tags, tagsData, label, name, touched, errors } = props

  const hasError = touched && errors;

  const [ inputVisible, setInputVisible ] = useState(false)
  const [ inputValue, setInputValue ] = useState('')

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setFieldValue(name, newTags)
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
          <Tag onClick={showInput} className={'ETGtag'}>
            <Icon type="plus" /> New Tag
          </Tag>
        )}
        {name && <ErrorMessage name={name as string} component='div' className='ui pointing red label' />}
      </div>
    </div>
  );
}

export default EditableTagGroup
