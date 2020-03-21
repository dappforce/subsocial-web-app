import React from 'react'
import { withFormik, FormikProps, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import HeadMeta from '../../utils/HeadMeta';
import Section from '../../utils/Section';
import { Button, AutoComplete, Switch } from 'antd';
import SimpleMDEReact from 'react-simplemde-editor';
import './NavigationEditor.css'
import Select, { SelectValue } from 'antd/lib/select';
import EditableTagGroup from 'src/components/utils/EditableTagGroup';
import ReorderNavTabs from '../reorder-navtabs/ReorderNavTabs';

const { Option } = AutoComplete;

interface FilterByTags {
  data: string[]
}

interface Url {
  data: string
}

type NavTabContent = FilterByTags | Url

type ContentType = 'by-tag' | 'url'

export interface NavTab {
  id: number
  title: string
  content: NavTabContent
  description: string
  hidden: boolean
  type: ContentType
}

export interface FormValues {
  navTabs: NavTab[]
}

interface OtherProps {
  tagsData: string[]
  typesOfContent: string[]
}

interface NavTabForOrder {
  id: number
  name: string
}

const InnerForm = (props: OtherProps & FormikProps<FormValues>) => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    typesOfContent,
    tagsData,
    isValid,
    isSubmitting
  } = props;

  const {
    navTabs
  } = values;

  const getMaxId = (): number => {
    const x = navTabs.reduce((cur, prev) => (cur.id > prev.id ? cur : prev))
    return x.id
  }

  const defaultTab = { id: getMaxId() + 1, title: '', type: 'ext-url', description: '', content: { data: '' }, hidden: false }

  const renderValueField = (nt: NavTab, index: number) => {
    switch (nt.type) {
      case 'url': {
        const url = nt.content.data ? nt.content.data : ''
        return (
          <Field
            type="text"
            name={`nt.${index}.content.data`}
            value={url}
            onChange={(e: React.FormEvent<HTMLInputElement>) => setFieldValue(`navTabs.${index}.content.data`, e.currentTarget.value)}
          />
        )
      }
      case 'by-tag': {
        const tags = nt.content.data || []
        return (
          <div className="NETagsWrapper">
            <EditableTagGroup
              tagsData={tagsData}
              name={`navTabs.${index}.content.data`}
              tags={tags as string[]}
              setFieldValue={setFieldValue}
            />
          </div>
        )
      }
      default: {
        return undefined
      }
    }
  }

  const renderReorderNavTabs = () => {
    return <ReorderNavTabs tabs={navTabs} onChange={(tabs) => handleSaveNavOreder(tabs)} />
  }

  const handleSaveNavOreder = (tabs: NavTab[]) => {
    setFieldValue('navTabs', tabs)
  }

  const handleTypeChange = (e: SelectValue, index: number) => {
    setFieldValue(`navTabs.${index}.type`, e)
    setFieldValue(`navTabs.${index}.content.data`, '')
  }

  const renderError = (index: number, name: keyof NavTab) => {
    if (touched &&
      errors.navTabs && errors.navTabs[index]?.[name]) {
      return <div className='ui pointing red label NEErrorMessage' >{errors.navTabs[index]?.[name]} </div>
    }
    return null
  }

  return <>
    <HeadMeta title={'Navigation Editor'} />
    <div className='NavEditorWrapper'>
      <Section className='NavigationEditor' title={'Navigation Editor'}>
        <Form className='ui form DfForm NavigationEditorForm'>
          <FieldArray
            name="navTabs"
            render={arrayHelpers => (
              <div>
                {values.navTabs && values.navTabs.length > 0 && (
                  values.navTabs.map((nt, index) => (
                    <div className={`NERow ${(nt.hidden ? 'NEHidden' : '')}`} key={nt.id}>

                      <div className="NEText">Name:</div>
                      <Field
                        type="text"
                        name={`nt.${index}.title`}
                        placeholder="Tab Name"
                        value={nt.title}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => setFieldValue(`navTabs.${index}.title`, e.currentTarget.value)}
                      />
                      {renderError(index, 'title')}
                      <div className="NEText">Description:</div>
                      <Field
                        component={SimpleMDEReact}
                        name={`navTabs.${index}.description`} value={nt.description}
                        onChange={(data: string) => setFieldValue(`navTabs.${index}.description`, data)}
                        className={`DfMdEditor NETextEditor`} />
                      <div className="NEText">Type of content:</div>
                      <Field
                        component={Select}
                        name={`nt.${index}.type`}
                        defaultValue={nt.type}
                        onChange={(e: SelectValue) => handleTypeChange(e, index)}
                        className={'NESelectType'}
                      >
                        {
                          typesOfContent.map((x) => <Option key={x} value={x} >{x}</Option>)
                        }
                      </Field>
                      <div className="NEText">Value:</div>
                      {
                        renderValueField(nt, index)
                      }
                      <div className="NEButtonsWrapper">
                        <div className="NEHideButton">
                          <Switch onChange={() => setFieldValue(`navTabs.${index}.hidden`, !nt.hidden)} />
                          Don&apos;t show this tab in blog navigation
                        </div>
                        <div className="NERemoveButton">
                          <Button type="default" onClick={() => arrayHelpers.remove(index)}>Delete tab</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div className="NERow">
                  <div
                    className="NEAddTab"
                    onClick={() => { arrayHelpers.push(defaultTab) }}
                  >
                    + Add Tab
                  </div>
                </div>
              </div>
            )}
          />

          <Button type='primary' htmlType='submit' disabled={!isValid || isSubmitting} className={'NESubmit'}>
            Save
          </Button>
        </Form>

      </Section>
      {renderReorderNavTabs()}
    </div>
  </>
}

// Validation
const TITLE_MIN_LEN = 2;
const TITLE_MAX_LEN = 50;

const schema = Yup.object().shape({
  navTabs: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string()
          .min(TITLE_MIN_LEN, `Title is too short. Min length is ${TITLE_MIN_LEN} chars.`)
          .max(TITLE_MAX_LEN, `Title is too long. Max length is ${TITLE_MAX_LEN} chars.`)
          .required('This field is required')
      })
    )
});

export interface NavEditorFormProps {
  tagsData: string[]
  navTabs: NavTab[]
  typesOfContent: ContentType[]
  tabsOrder: NavTabForOrder[]
}

const NavigationEditor = withFormik<NavEditorFormProps, FormValues>({
  mapPropsToValues: props => {
    return {
      navTabs: props.navTabs,
      tabsOrder: props.tabsOrder
    };
  },

  validationSchema: schema,

  handleSubmit: values => {
    console.log(values)
  }
})(InnerForm);

export default NavigationEditor
