import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import Section from '../utils/Section';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@subsocial/react-api';

import { useSubsocialApi } from '../utils/SubsocialApiContext'
import * as DfForms from '../utils/forms';
import { getTxParams, profilesQueryToProp } from '../utils/index';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';

import Router from 'next/router';
import HeadMeta from '../utils/HeadMeta';
import { TxFailedCallback } from '@subsocial/react-components/Status/types';
import { TxCallback } from '../utils/types';
import { IpfsHash } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { ProfileUpdate, OptionText } from '@subsocial/types/substrate/classes';
import { newLogger } from '@subsocial/utils';
import { ValidationProps, buildValidationSchema } from './ProfileValidation';
import { ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './address-views/utils/withLoadedOwner';
import DfMdEditor from '../utils/DfMdEditor';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const log = newLogger('Edit profile')
export type OuterProps = MyAccountProps & ValidationProps & {
  myAddress: string,
  owner?: ProfileData,
  requireProfile?: boolean,
};

type FormValues = ProfileContent & {
  username: string;
};

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = DfForms.LabelledField<FormValues>();

const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    myAddress,
    owner,
    values,
    errors,
    dirty,
    isValid,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm
  } = props;

  const {
    username,
    fullname,
    avatar,
    email,
    personalSite,
    about,
    facebook,
    twitter,
    linkedIn,
    medium,
    github,
    instagram
  } = values;

  const profile = owner?.profile

  const goToView = () => {
    if (myAddress) {
      // TODO use accountUrl({ address, username })
      Router.push(`/profile/${myAddress}`).catch(err => log.error('Error while route:', err));
    }
  };
  const { ipfs } = useSubsocialApi()
  const [ ipfsHash, setIpfsHash ] = useState<IpfsHash>();

  const onTxFailed: TxFailedCallback = (_txResult: SubmittableResult | null) => {
    ipfsHash && ipfs.removeContent(ipfsHash.toString()).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxSuccess: TxCallback = (_txResult: SubmittableResult) => {
    setSubmitting(false);
    goToView();
  };

  const newTxParams = (hash: IpfsHash) => {
    if (!isValid) return [];

    if (!profile) {
      return [ username, hash ];
    } else {
      // TODO update only dirty values.
      const update = new ProfileUpdate(
        {
          username: new OptionText(username),
          ipfs_hash: new OptionText(hash)
        });
      return [ update ];
    }
  };

  const title = profile ? `Edit profile` : `New profile`;
  const shouldBeValidUrlText = `Should be a valid URL.`;

  return (<>
    <HeadMeta title={title}/>
    <Section className='EditEntityBox' title={title}>
      <Form className='ui form DfForm EditEntityForm'>

        <LabelledText
          name='username'
          label='Username'
          placeholder={`You can use a-z, 0-9, dashes and underscores.`}
          style={{ maxWidth: '30rem' }}
          {...props}
        />

        <LabelledText
          name='fullname'
          label='Fullname'
          placeholder='Enter your fullname'
          {...props}
        />

        <LabelledText
          name='avatar'
          label='Avatar URL'
          placeholder={`Should be a valid image URL.`}
          {...props}
        />

        <LabelledText
          name='email'
          label='Email'
          placeholder='Enter your email'
          {...props}
        />

        <LabelledText
          name='personalSite'
          label='Personal site'
          placeholder='Address for personal site'
          {...props}
        />

        <LabelledText
          name='facebook'
          label='Facebook profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledText
          name='twitter'
          label='Twitter profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledText
          name='linkedIn'
          label='LinkedIn profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledText
          name='medium'
          label='Medium profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledText
          name='github'
          label='GitHub profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledText
          name='instagram'
          label='Instagram profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledField name='about' label='About' {...props}>
          <Field component={DfMdEditor} name='about' value={about} onChange={(data: string) => setFieldValue('about', data)} className={`DfMdEditor ${errors['about'] && 'error'}`} />
        </LabelledField>

        <LabelledField {...props}>
          <TxButton
            size='medium'
            icon='send'
            label={profile
              ? 'Update my profile'
              : 'Create my profile'
            }
            isDisabled={!dirty || isSubmitting}
            params={() => getTxParams({
              json: {
                fullname,
                avatar,
                email,
                personalSite,
                about,
                facebook,
                twitter,
                linkedIn,
                medium,
                github,
                instagram
              },
              buildTxParamsCallback: newTxParams,
              setIpfsHash,
              ipfs
            })}
            tx={profile
              ? 'profiles.updateProfile'
              : 'profiles.createProfile'
            }
            onFailed={onTxFailed}
            onSuccess={onTxSuccess}
          />
          <Button
            type='button'
            size='medium'
            disabled={!dirty || isSubmitting}
            onClick={() => resetForm()}
            content='Reset form'
          />
        </LabelledField>
      </Form>
    </Section>
  </>
  );
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { owner } = props;
    const content = owner?.content
    const profile = owner?.profile
    if (profile && content) {
      const username = profile.username.toString();
      return {
        username,
        ...content
      };
    } else {
      return {
        username: '',
        fullname: '',
        avatar: '',
        about: '',
        email: '',
        personalSite: '',
        facebook: '',
        twitter: '',
        linkedIn: '',
        medium: '',
        github: '',
        instagram: ''
      };
    }
  },

  validationSchema: buildValidationSchema,

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

export const EditFormWithValidation = withMulti(
  EditForm,
  withCalls<OuterProps>(
    profilesQueryToProp('minUsernameLen', { propName: 'usernameMinLen' }),
    profilesQueryToProp('maxUsernameLen', { propName: 'usernameMaxLen' })
  )
);

export const NewProfile = withMulti(
  EditFormWithValidation,
  withMyAccount
);

export const EditProfile = withMulti(
  EditFormWithValidation,
  withMyAccount,
  withLoadedOwner
);

export default NewProfile;
