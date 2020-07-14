import React, { useState } from 'react';
import { Tag, Input, Tooltip, Icon, AutoComplete } from 'antd';
import { ErrorMessage } from 'formik';
import { SelectValue } from 'antd/lib/select';
import { nonEmptyStr } from '@subsocial/utils';

type Props = {
  name: string,
  label?: string,
  tags?: string[],
  tagSuggestions?: string[],
  setFieldValue: (a: string, b: string[]) => void,
  hasError?: boolean
}

const VISIBLE_TAG_CHARS = 20

const EditableTagGroup = (props: Props) => {
  const { setFieldValue, tags = [], tagSuggestions = [], label, name, hasError } = props

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
    if (nonEmptyStr(inputValue) && tags.indexOf(inputValue) < 0) {
      const newTags = [ ...tags, inputValue ];
      setFieldValue(name, newTags)
      setInputVisible(false)
    }
  };

  return (
    <div className={`ui--Labelled field ${hasError ? 'error' : ''}`}>
      <label htmlFor={name}>{nonEmptyStr(label) && label + ':'}</label>
      <div className='ui--Labelled-content'>
        {tags.map((tag) => {
          const isLongTag = tag.length > VISIBLE_TAG_CHARS;
          const tagElem = (
            <Tag key={tag} closable={true} onClose={() => handleClose(tag)}>
              {isLongTag ? `${tag.slice(0, VISIBLE_TAG_CHARS)}...` : tag}
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
            dataSource={tagSuggestions}
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
        {name && <ErrorMessage name={name} component='div' className='ui pointing red label' />}
      </div>
    </div>
  );
}

export default EditableTagGroup
