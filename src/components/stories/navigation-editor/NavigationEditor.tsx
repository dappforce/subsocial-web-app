import React from 'react'
import { withFormik, FormikProps, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import HeadMeta from '../../utils/HeadMeta';
import Section from '../../utils/Section';
import { Button, Icon } from 'antd';
import { PostId } from 'src/components/types';
import TagsInput from '../tags-input/TagsInput';

import './NavigationEditor.css'

// Shape of form values
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
  posts: PartialPost[]
}

const InnerForm = (props: OtherProps & FormikProps<FormValues>) => {
  const {
    values,
    //posts,
    //errors,
    setFieldValue,
  } = props;

  const {
    navTabs,
    typesOfContent
  } = values;

  return <>
    <HeadMeta title={'Navigation Editor'} />
    <Section className='NavigationEditor' title={'Navigation Editor'}>
      <div className="NERow NEHead">
        <div className="NEText">Tab Name</div>
        <div className="NEText">Type of content</div>
        <div className="NEText">Filter value</div>
      </div>
      <Form className='ui form DfForm NavigationEditorForm'>
        <FieldArray
          name="navTabs"
          render={arrayHelpers => (
            <div>
              {values.navTabs && values.navTabs.length > 0 && (
                values.navTabs.map((nt, index) => (
                  <div className={`NERow ${(!nt.show && 'NEHidden')}`} key={nt.id}>
                    <div className="NEHideButton">
                      <Icon
                        type="eye-invisible"
                        onClick={() => setFieldValue(`navTabs.${index}.show`, !nt.show)}
                      />
                    </div>
                    <div className="NERemoveButton">
                      <Icon
                        type="delete"
                        onClick={() => arrayHelpers.remove(index)}
                      />
                    </div>
                    <Field
                      type="text"
                      name={`nt.${index}.name`}
                      placeholder="Tab Name"
                      value={nt.name}
                      onChange={(e: React.FormEvent<HTMLInputElement>) => setFieldValue(`navTabs.${index}.name`, e.currentTarget.value)}
                    />
                    <Field component="select" name={`nt.${index}.type`} defaultValue={nt.type}>
                      {
                        typesOfContent.map((x) => <option key={x} value={x} >{x}</option>)
                      }
                    </Field>
                    {nt.type === 'ext-url' || nt.type === 'blog-url' ?
                      <Field
                        type="text"
                        name={`nt.${index}.value`}
                        value={nt.value}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => setFieldValue(`navTabs.${index}.value`, e.currentTarget.value)}
                      />
                      :
                      <div className="NETagsWrapper">
                        <TagsInput 
                          currentTab={index}
                          {...props}
                        />
                      </div>
                    }
                  </div>
                ))
              )}
              <div className="NERow">
                <div 
                  className="NEAddTab"
                  onClick={() => {arrayHelpers.push({id: navTabs.length+1, name: '', type: 'ext-url', value: '', show: true })}}
                  >
                    + Add Tab
                </div>
              </div>
            </div>
          )}
        />
        
        <Button type="primary" htmlType="submit" disabled={false} className={'NESubmit'}>
          Save
        </Button>
      </Form>

    </Section>
  </>
}



// Validation
const TITLE_REGEX = /^[A-Za-z0-9_-]+$/;
const TITLE_MIN_LEN = 2;
const TITLE_MAX_LEN = 50;

const buildSchema = () => Yup.object().shape({
  name: Yup.string()
    .required('Title is required')
    .matches(TITLE_REGEX, 'Title can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).')
    .min(TITLE_MIN_LEN, `Title is too short. Minimum length is ${TITLE_MIN_LEN} chars.`)
    .max(TITLE_MAX_LEN, `Title is too long. Maximum length is ${TITLE_MAX_LEN} chars.`),
})

// The type of props MyForm receives
export interface NavEditorFormProps {
  tags: string[]
  posts: PartialPost[]
  navTabs: NavTab[]
  typesOfContent: string[]
}

// Wrap our form with the withFormik HoC
const NavigationEditor = withFormik<NavEditorFormProps, FormValues>({
  // Transform outer props into form values
  mapPropsToValues: props => {
    return {
      navTabs: props.navTabs,
      typesOfContent: props.typesOfContent
    };
  },

  //validationSchema: buildSchema,

  handleSubmit: values => {
    console.log(values)
  },
})(InnerForm);


export default NavigationEditor
