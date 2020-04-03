
import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { Tag, Input, Tooltip, Icon, AutoComplete } from 'antd';
import { FormikProps } from 'formik';
import { FormValues } from '../navigation-editor/NavigationEditor'
import { SelectValue } from 'antd/lib/select';

interface OtherProps {
  tagsData: string[]
  currentTab: number
}

const EditableTagGroup = (props: OtherProps & FormikProps<FormValues>) => {
  const { setFieldValue, values, currentTab, tagsData } = props
  const { navTabs } = values;
  const data = navTabs[currentTab].content.data as string[]

  const tags: string[] = data ? data : []

  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setFieldValue(`navTabs.${currentTab}.content.data`, newTags)
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: SelectValue) => {
    setInputValue(e.toString());
  };

  const handleInputConfirm = () => {
    let newTags = ['']
    if (inputValue && tags.indexOf(inputValue) === -1) {
      newTags = [...tags, inputValue];
      setFieldValue(`navTabs.${currentTab}.content.data`, newTags)
    }
    setInputVisible(false)
    setInputValue('')
  };

  return (
    <div>
      {tags.map((tag, index) => {
        const isLongTag = tag.length > 20;
        const tagElem = (
          <Tag key={tag} closable={index !== 0} onClose={() => handleClose(tag)}>
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
    </div>
  );
}

export default EditableTagGroup
