
import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { Tag, Input, Tooltip, Icon } from 'antd';
import { FormikProps } from 'formik';
import { PostId } from 'src/components/types';

export interface PartialPost { id: PostId, title: string }

export interface NavTab {
  id: number
  name: string
  type: string
  value: string
  show: boolean
}

interface FormValues {
  navTabs: NavTab[]
  typesOfContent: string[]
}

interface OtherProps {
  tags: string[]
  currentTab: number
}

const EditableTagGroup = (props: OtherProps & FormikProps<FormValues>) => {
    const {setFieldValue, values, currentTab} = props
    const {navTabs} = values;

    const tags = navTabs[currentTab].value.split(', ')
    const [inputVisible, setInputVisible] = useState(false)
    const [inputValue, setInputValue] = useState('')


    const handleClose = (removedTag: string) => {
        const newTags = tags.filter(tag => tag !== removedTag);
        setFieldValue(`navTabs.${currentTab}.value`, newTags.join(', '))
    };

    const showInput = () => {
        setInputVisible(true);
    };

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        setInputValue(e.currentTarget.value);
    };

    const handleInputConfirm = () => {
        let newTags = ['']
        if (inputValue && tags.indexOf(inputValue) === -1) {
            newTags = [...tags, inputValue];
            setFieldValue(`navTabs.${currentTab}.value`, newTags.join(', '))
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
                <Input
                    autoFocus 
                    type="text"
                    size="small"
                    style={{ width: 78 }}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                />
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
