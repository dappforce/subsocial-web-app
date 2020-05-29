import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps, FieldArray } from 'formik';
import { Option } from '@polkadot/types';
import Section from '../utils/Section';
import { socialQueryToProp } from '../utils/index';
import { getNewIdFromEvent, Loading } from '../utils';
import { useMyAddress } from '../utils/MyAccountContext';
import Router from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { AutoComplete, Switch, Affix, Alert } from 'antd';
import Select, { SelectValue } from 'antd/lib/select';
import EditableTagGroup from '../utils/EditableTagGroup';
import ReorderNavTabs from '../utils/ReorderNavTabs';
import { SubmittableResult } from '@polkadot/api';
import dynamic from 'next/dynamic';
import { withSpaceIdFromUrl } from './withSpaceIdFromUrl';
import { validationSchema } from './NavValidation';
import SpacegedSectionTitle from '../spaces/SpacegedSectionTitle';
import { Space, IpfsHash } from '@subsocial/types/substrate/interfaces';
import { SpaceContent, NavTab } from '@subsocial/types/offchain';
import { SpaceUpdate, OptionText, OptionOptionText, OptionBool } from '@subsocial/types/substrate/classes';
import { withMulti, withCalls } from '@subsocial/react-api';
import BN from 'bn.js'
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import DfMdEditor from '../utils/DfMdEditor';
import { getTxParams } from '../utils/substrate/getTxParams'

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

export interface FormValues {
  navTabs: NavTab[]
}

interface OuterProps {
  struct: Space;
  json: SpaceContent;
  id: BN;
}

const InnerForm = (props: OuterProps & FormikProps<FormValues>) => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    isValid,
    isSubmitting,
    setSubmitting,
    struct,
    id,
    json
  } = props;

  const {
    navTabs
  } = values;

  const {
    desc,
    image,
    tags: spaceTags = [],
    name
  } = json

  const getMaxId = (): number => {
    if (navTabs.length === 0) return 0

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
        const tags = nt.content.data as string[] || []
        return (
          <div className="NETagsWrapper">
            <EditableTagGroup
              name={`navTabs.${index}.content.data`}
              tags={tags}
              tagSuggestions={spaceTags}
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

  const handleSaveNavOrder = (tabs: NavTab[]) => {
    setFieldValue('navTabs', tabs)
  }

  const handleTypeChange = (e: SelectValue, index: number) => {
    setFieldValue(`navTabs.${index}.type`, e)
    setFieldValue(`navTabs.${index}.content.data`, '')
  }

  const renderError = (index: number, name: keyof NavTab) => {
    if (touched &&
      errors.navTabs && errors.navTabs[index]?.[name]) {
      return <div className='ui pointing red label NEErrorMessage'>{errors.navTabs[index]?.[name]}</div>
    }
    return null
  }

  const { ipfs } = useSubsocialApi()
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();

  const onTxFailed = () => {
    ipfsHash && ipfs.removeContent(ipfsHash).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    const _id = id || getNewIdFromEvent(_txResult);
    console.log('onTxSuccess _id:', _id)
    _id && goToView(_id);
  };

  const goToView = (id: BN) => {
    Router.push('/spaces/' + id.toString()).catch(console.log);
  };

  const newTxParams = (hash: IpfsHash) => {
    if (!isValid || !struct) return [];

    const update = new SpaceUpdate({
      handle: new OptionOptionText(null),
      ipfs_hash: new OptionText(hash),
      hidden: new OptionBool(false) // TODO has no implementation on UI
    });
    return [ struct.id, update ];
  };

  const pageTitle = `Edit space navigation`

  const sectionTitle =
    <SpacegedSectionTitle spaceId={struct.id} title={pageTitle} />

  return <>
    <HeadMeta title={pageTitle} />
    <div className='NavEditorWrapper'>
      <Section className='EditEntityBox NavigationEditor' title={sectionTitle}>
        <Form className='ui form DfForm NavigationEditorForm'>
          <FieldArray
            name="navTabs"
            render={arrayHelpers => (
              <div>
                {values.navTabs && values.navTabs.length > 0 && (
                  values.navTabs.map((nt, index) => (
                    <div className={`NERow ${(nt.hidden ? 'NEHidden' : '')}`} key={nt.id}>

                      <div className="NEText">Tab name:</div>
                      <Field
                        type="text"
                        name={`nt.${index}.title`}
                        placeholder="Tab name"
                        style={{ maxWidth: '30rem' }}
                        value={nt.title}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => setFieldValue(`navTabs.${index}.title`, e.currentTarget.value)}
                      />
                      {renderError(index, 'title')}

                      <div className="NEText">Type of content:</div>
                      <Field
                        component={Select}
                        name={`nt.${index}.type`}
                        defaultValue={nt.type}
                        onChange={(e: SelectValue) => handleTypeChange(e, index)}
                        className={'NESelectType'}
                      >
                        {
                          typesOfContent.map((x) => <AutoComplete.Option key={x} value={x}>{x}</AutoComplete.Option>)
                        }
                      </Field>

                      <div className="NEText">Value:</div>
                      {renderValueField(nt, index)}

                      <div className="NEText">Description:</div>
                      <Field
                        component={DfMdEditor}
                        name={`navTabs.${index}.description`} value={nt.description}
                        onChange={(data: string) => setFieldValue(`navTabs.${index}.description`, data)}
                        className={`DfMdEditor NETextEditor`} />

                      <div className="NEButtonsWrapper">
                        <div className="NEHideButton">
                          <Switch onChange={() => setFieldValue(`navTabs.${index}.hidden`, !nt.hidden)} />
                          Don't show this tab in space navigation
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

          <TxButton
            size='medium'
            label={'Update Navigation'}
            isDisabled={!isValid || isSubmitting}
            params={() => getTxParams({
              json: { name, desc, image, tags: spaceTags, navTabs },
              buildTxParamsCallback: newTxParams,
              setIpfsHash,
              ipfs
            })}
            tx={'social.updateSpace'}
            onFailed={onTxFailed}
            onSuccess={onTxSuccess}
          />

        </Form>
      </Section>

      <Affix offsetTop={80}>
        <div style={{ marginLeft: '2rem', minWidth: '300px' }}>
          <Alert type="info" showIcon closable message="Drag tabs to reorder them." style={{ marginBottom: '1rem' }} />
          <ReorderNavTabs tabs={navTabs} onChange={(tabs: NavTab[]) => handleSaveNavOrder(tabs)} />
        </div>
      </Affix>
    </div>
  </>
}

export interface NavEditorFormProps {
  struct: Space;
  json: SpaceContent;
  id: BN;
}

export const NavigationEditor = withFormik<NavEditorFormProps, FormValues>({
  mapPropsToValues: props => {
    const { json } = props;
    if (json && json.navTabs) {
      return {
        navTabs: json.navTabs
      };
    } else {
      return {
        navTabs: []
      };
    }
  },

  validationSchema,

  handleSubmit: values => {
    console.log(values)
  }
})(InnerForm);

type LoadStructProps = OuterProps & {
  structOpt: Option<Space>;
};

// TODO refactor copypasta. See the same function in EditSpace
function LoadStruct (props: LoadStructProps) {
  const myAddress = useMyAddress()
  const { ipfs } = useSubsocialApi()
  const { structOpt } = props;
  const [ json, setJson ] = useState<SpaceContent>();
  const [ struct, setStruct ] = useState<Space>();
  const [ trigger, setTrigger ] = useState(false);
  const jsonIsNone = json === undefined;

  const toggleTrigger = () => {
    json === undefined && setTrigger(!trigger);
  };

  useEffect(() => {
    if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();

    setStruct(structOpt.unwrap());

    if (struct === undefined) return toggleTrigger();

    console.log('Loading space JSON from IPFS');
    ipfs.findSpace(struct.ipfs_hash.toString()).then(json => {
      setJson(json);
    }).catch(err => console.log(err));
  }, [ trigger ]);

  if (!myAddress || !structOpt || jsonIsNone) {
    return <Loading />;
  }

  if (!struct || !struct.owner.eq(myAddress)) {
    return <em>You have no rights to edit this space</em>;
  }

  if (structOpt.isNone) {
    return <em>Space not found...</em>;
  }

  return <NavigationEditor {...props} struct={struct} json={json as SpaceContent} />;
}

export const EditNavigation = withMulti(
  LoadStruct,
  withSpaceIdFromUrl,
  withCalls<OuterProps>(
    socialQueryToProp('spaceById', { paramName: 'id', propName: 'structOpt' })
  )
);

export default EditNavigation;
