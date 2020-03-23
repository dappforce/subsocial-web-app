import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Option } from '@polkadot/types';
import Section from '../utils/Section';
import { withCalls, withMulti } from '@polkadot/ui-api';
import { getJsonFromIpfs } from '../utils/OffchainUtils';
import { queryBlogsToProp } from '../utils/index';
import { BlogId, Blog, BlogContent, NavTab } from '../types';
import { Loading } from '../utils/utils';
import { useMyAccount } from '../utils/MyAccountContext';
import SimpleMDEReact from 'react-simplemde-editor';
import { useRouter } from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { AutoComplete, Switch } from 'antd';
import Select, { SelectValue } from 'antd/lib/select';
import EditableTagGroup from '../utils/EditableTagGroup';
import ReorderNavTabs from '../stories/reorder-navtabs/ReorderNavTabs';

export interface FormValues {
  navTabs: NavTab[]
}

interface OuterProps {
  tagsData: string[]
  struct?: Blog;
  json?: BlogContent;
  id?: BlogId;
}

const InnerForm = (props: OuterProps & FormikProps<FormValues>) => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
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
  const typesOfContent = [ 'url', 'by-tag' ]

  const defaultTab = { id: getMaxId() + 1, title: '', type: 'url', description: '', content: { data: '' }, hidden: false }

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
  tagsData: string[];
  struct?: Blog;
  json?: BlogContent;
  id?: BlogId;
}

// Wrap our form with the withFormik HoC
const NavigationEditor = withFormik<NavEditorFormProps, FormValues>({
  // Transform outer props into form values
  mapPropsToValues: props => {
    const { struct, json } = props;
    if (struct && json) {
      return {
        navTabs: props.json?.navTabs as NavTab[]
      };
    } else {
      return {
        navTabs: []
      };
    }
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

export const NewNavigation = withMulti(
  NavigationEditor
  // , withOnlyMembers
);

export const EditNavigation = withMulti(
  LoadStruct,
  withIdFromUrl,
  withCalls<OuterProps>(
    queryBlogsToProp('blogById', { paramName: 'id', propName: 'structOpt' })
  )
);

export default NewNavigation;
