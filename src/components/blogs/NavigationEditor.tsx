import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Option } from '@polkadot/types';
import Section from '../utils/Section';
import { withCalls, withMulti } from '@polkadot/ui-api';
import { getJsonFromIpfs } from '../utils/OffchainUtils';
import { queryBlogsToProp } from '../utils/index';
import { BlogId, Blog, BlogContent, PostId } from '../types';
import { Loading } from '../utils/utils';
import { useMyAccount } from '../utils/MyAccountContext';
import SimpleMDEReact from 'react-simplemde-editor';
import { useRouter } from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { AutoComplete, Switch } from 'antd';
import Select, { SelectValue } from 'antd/lib/select';
import EditableTagGroup from '../utils/EditableTagGroup';
import ReorderNavTabs from '../stories/reorder-navtabs/ReorderNavTabs';

// Shape of form values
interface PartialPost { id: PostId, title: string }
interface PartialBlog { id: BlogId, title: string }

interface FilterByTags {
  data: string[]
}

interface SpecificPost {
  data: string
}

interface OuterUrl {
  data: string
}

interface SpecificBlog {
  data: string
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
  navTabs: NavTab[],
  tabsOrder: NavTabForOrder[]
}

interface OuterProps {
  tagsData: string[]
  posts: PartialPost[]
  typesOfContent: string[]
  blogs: PartialBlog[]
  id?: BlogId;
  struct?: Blog;
  json?: BlogContent;
}

interface NavTabForOrder {
  id: number
  name: string
}

const InnerForm = (props: OuterProps & FormikProps<FormValues>) => {
  const {
    values,
    posts,
    blogs,
    errors,
    touched,
    setFieldValue,
    typesOfContent,
    tagsData,
    isValid,
    isSubmitting
  } = props;

  const {
    navTabs,
    tabsOrder
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
        // const blogId = nt.content.data ? nt.content.data.toString() : undefined
        // const currentBlog: PartialBlog | undefined = blogs.find(x => x.id.toString() === blogId)
        // let currentBlogTitle = ''
        // if (currentBlog) currentBlogTitle = currentBlog.title
        const options = blogs.map(x => (
          <AutoComplete.Option key={x.id.toString()} value={x.id.toString()}>
            {x.title}
          </AutoComplete.Option>
        ))

        const handleBlogChange = (e: SelectValue) => {
          // TODO if e is BlogId or link or slug

          setFieldValue(`navTabs.${index}.content.data`, e.toString())
        }

        return (
          <AutoComplete
            dataSource={options}
            onChange={(e: SelectValue) => handleBlogChange(e)}
            optionLabelProp={'value'}
            // value={currentBlogTitle}
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
        // const postId = nt.content.data ? nt.content.data.toString() : undefined
        // const currentPost: PartialPost | undefined = posts.find(x => x.id.toString() === postId)
        // let currentPostTitle: string | undefined
        // if (currentPost) currentPostTitle = currentPost.title
        const options = posts.map(x => (
          <AutoComplete.Option key={x.id.toString()} value={x.id.toString()}>
            {x.title}
          </AutoComplete.Option>
        ))

        const handlePostChange = (e: SelectValue) => {
          // TODO if e is PostId or link or slug

          setFieldValue(`navTabs.${index}.content.data`, e.toString())
        }

        return (
          <AutoComplete
            dataSource={options}
            onChange={(e: SelectValue) => handlePostChange(e)}
            optionLabelProp={'value'}
            // value={currentPostTitle}
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

    return <ReorderNavTabs tabs={tabsOrder} onChange={(tabs) => handleSaveNavOreder(tabs)} />
  }

  const handleSaveNavOreder = (tabs: NavTabForOrder[]) => {
    console.log('The current order of tabs:', tabs)
    setFieldValue('tabsOrder', tabs)
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
                          typesOfContent.map((x) => <AutoComplete.Option key={x} value={x} >{x}</AutoComplete.Option>)
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
  posts: PartialPost[]
  // navTabs: NavTab[]
  typesOfContent: ContentType[]
  blogs: PartialBlog[]
  // tabsOrder: NavTabForOrder[]
  id?: BlogId;
  struct?: Blog;
  json?: BlogContent;
}

// Wrap our form with the withFormik HoC
const NavigationEditor = withFormik<NavEditorFormProps, FormValues>({
  // Transform outer props into form values
  mapPropsToValues: props => {
    return {
      navTabs: props.struct,
      tabsOrder: props.tabsOrder
    };
  },

  validationSchema: schema,

  handleSubmit: values => {
    console.log(values)
  }
})(InnerForm);

function withIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function (props: OuterProps) {
    const router = useRouter();
    const { blogId } = router.query;
    try {
      return <Component id={new BlogId(blogId as string)} {...props} />;
    } catch (err) {
      return <em>Invalid blog ID: {blogId}</em>;
    }
  };
}

type LoadStructProps = OuterProps & {
  structOpt: Option<Blog>;
};

type StructJson = BlogContent | undefined;

type Struct = Blog | undefined;

function LoadStruct (props: LoadStructProps) {
  const { state: { address: myAddress } } = useMyAccount();
  const { structOpt } = props;
  const [ json, setJson ] = useState(undefined as StructJson);
  const [ struct, setStruct ] = useState(undefined as Struct);
  const [ trigger, setTrigger ] = useState(false);
  const jsonIsNone = json === undefined;

  const toggleTrigger = () => {
    json === undefined && setTrigger(!trigger);
  };

  useEffect(() => {
    if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();

    setStruct(structOpt.unwrap());

    if (struct === undefined) return toggleTrigger();

    console.log('Loading blog JSON from IPFS');
    getJsonFromIpfs<BlogContent>(struct.ipfs_hash).then(json => {
      setJson(json);
    }).catch(err => console.log(err));
  }, [ trigger ]);

  if (!myAddress || !structOpt || jsonIsNone) {
    return <Loading />;
  }

  if (!struct || !struct.created.account.eq(myAddress)) {
    return <em>You have no rights to edit this blog</em>;
  }

  if (structOpt.isNone) {
    return <em>Blog not found...</em>;
  }

  return <NavigationEditor {...props} struct={struct} json={json} />;
}

/*
export const NewBlog = withMulti(
  EditForm,
  withCalls<OuterProps>(
    ...commonQueries
  )
  // , withOnlyMembers
);
*/

export const EditNavigation = withMulti(
  LoadStruct,
  withIdFromUrl,
  withCalls<OuterProps>(
    queryBlogsToProp('blogById', { paramName: 'id', propName: 'structOpt' }),
  )
);

export default EditNavigation;
