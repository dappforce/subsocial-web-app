import React from 'react'
import { withFormik, FormikProps, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import HeadMeta from '../../utils/HeadMeta';
import Section from '../../utils/Section';
import { Button, AutoComplete, Switch } from 'antd';
import { PostId, BlogId } from 'src/components/types';
import TagsInput from '../tags-input/TagsInput';
import SimpleMDEReact from 'react-simplemde-editor';
import './NavigationEditor.css'
import Select, { SelectValue } from 'antd/lib/select';

const { Option } = AutoComplete;

// Shape of form values
interface PartialPost { id: PostId, title: string }
interface PartialBlog { id: BlogId, title: string }

interface FilterByTags {
  data: string[]
}

interface SpecificPost {
  data: PostId
}

interface OuterUrl {
  data: string
}

interface SpecificBlog {
  data: BlogId
}

type NavTabContent = FilterByTags | SpecificPost | OuterUrl | SpecificBlog

type ContentType = 'by-tag' | 'ext-url' | 'post-url' | 'blog-url'

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
  posts: PartialPost[]
  typesOfContent: string[]
  blogs: PartialBlog[]
}

const InnerForm = (props: OtherProps & FormikProps<FormValues>) => {
  const {
    values,
    posts,
    blogs,
    errors,
    touched,
    setFieldValue,
    typesOfContent,
    tagsData
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
      case 'ext-url': {
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
      case 'blog-url': {
        const blogId = nt.content.data ? nt.content.data.toString() : undefined
        const currentBlog: PartialBlog | undefined = blogs.find(x => x.id.toString() === blogId)
        let currentBlogTitle = ''
        if (currentBlog) currentBlogTitle = currentBlog.title
        const options = blogs.map(x => (
          <Option key={x.id.toString()} value={x.id.toString()}>
            {x.title}
          </Option>
        ))

        return (
          <AutoComplete
            dataSource={options}
            onChange={(e: SelectValue) => setFieldValue(`navTabs.${index}.content.data`, new BlogId(e.toString()))}
            optionLabelProp={'value'}
            value={currentBlogTitle}
          >
            <Field
              autoComplete={'off'}
              type="text"
              name={`nt.${index}.content.data`}
            />
          </AutoComplete>
        )

      }
      case 'post-url': {
        const postId = nt.content.data ? nt.content.data.toString() : undefined
        const currentPost: PartialPost | undefined = posts.find(x => x.id.toString() === postId)
        let currentPostTitle = ''
        if (currentPost) currentPostTitle = currentPost.title
        const options = posts.map(x => (
          <Option key={x.id.toString()} value={x.id.toString()}>
            {x.title}
          </Option>
        ))

        return (
          <AutoComplete
            dataSource={options}
            onChange={(e: SelectValue) => setFieldValue(`navTabs.${index}.content.data`, new PostId(e.toString()))}
            optionLabelProp={'value'}
            value={currentPostTitle}
          >
            <Field
              autoComplete={'off'}
              type="text"
              name={`nt.${index}.content.data`}
            />
          </AutoComplete>
        )

      }
      case 'by-tag': {
        return (
          <div className="NETagsWrapper">
            <TagsInput
              currentTab={index}
              tagsData={tagsData}
              {...props}
            />
          </div>
        )
      }
      default: {
        return undefined
      }
    }
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

const schema = Yup.object().shape({
  navTabs: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string()
          .matches(TITLE_REGEX, 'Title can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).')
          .min(TITLE_MIN_LEN, 'Title is too short (min length: 2)')
          .max(TITLE_MAX_LEN, 'Title is too long (max length: 50)')
          .required('Required message')
      })
    )
});

// The type of props MyForm receives
export interface NavEditorFormProps {
  tagsData: string[]
  posts: PartialPost[]
  navTabs: NavTab[]
  typesOfContent: ContentType[]
  blogs: PartialBlog[]
}

// Wrap our form with the withFormik HoC
const NavigationEditor = withFormik<NavEditorFormProps, FormValues>({
  // Transform outer props into form values
  mapPropsToValues: props => {
    return {
      navTabs: props.navTabs
    };
  },

  validationSchema: schema,

  handleSubmit: values => {
    console.log(values)
  }
})(InnerForm);

export default NavigationEditor
