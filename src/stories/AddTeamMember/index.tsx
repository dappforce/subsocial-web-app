import React, { useState } from 'react';
import { withFormik, FormikProps, Form, Field } from 'formik';
import { Switch, DatePicker, Button } from 'antd';
import SimpleMDEReact from 'react-simplemde-editor';
import moment from 'moment-timezone';
import { Moment } from 'moment-timezone/moment-timezone';

import * as DfForms from '../../components/utils/forms';
import { FieldNames } from '../../components/utils/forms';
import HeadMeta from '../../components/utils/HeadMeta';
import Section from '../../components/utils/Section';

import './index.css';
import { buildValidationSchema } from './validation';

type Company = {
  id: number,
  name: string,
  img: string
};

// TODO rename
export type CompanyData = Company[];

interface OtherProps {
  companyData: CompanyData;
  employerTypesData: string[];
}

// Shape of form values
interface FormValues {
  title: string
  employmentType: string
  company: string
  location: string
  startDate: Moment
  endDate: Moment
  showEndDate: boolean
  description: string
}

const fields: FieldNames<FormValues> = {
  title: 'title',
  employmentType: 'employmentType',
  company: 'company',
  location: 'location',
  startDate: 'startDate',
  endDate: 'endDate',
  showEndDate: 'showEndDate',
  description: 'description'
}

const LabelledField = DfForms.LabelledField<FormValues>();
const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: OtherProps & FormikProps<FormValues>) => {
  const {
    values,
    errors,
    setFieldValue,
    companyData,
    employerTypesData
  } = props;

  const {
    description,
    company,
    startDate,
    endDate,
    showEndDate
  } = values;

  const [ companyLogo, setCompanyLogo ] = useState<string>();
  const [ companyAutocomplete, setCompanyAutocomplete ] = useState<CompanyData>([]);

  const handleCompanyChange = (e: React.FormEvent<HTMLInputElement>) => {

    if (!e.currentTarget.value) {
      setCompanyAutocomplete([]);
    }

    setFieldValue(fields.company, e.currentTarget.value);
    setCompanyLogo(undefined);

    if (company) {
      company.toLowerCase();

      const results = companyData.filter(function (item) {
        return item.name.toLowerCase().includes(company);
      });

      if (results) setCompanyAutocomplete(results);
    }
  };

  const handleCompanyAutocomplete = (data: Company) => {
    setFieldValue(fields.company, data.name);

    setCompanyAutocomplete([]);
    setCompanyLogo(data.img);
  };

  const toggleShowEndDate = () => {
    setFieldValue(fields.showEndDate, !showEndDate);
  };

  const disabledStartEndDate = (current: Moment | null) => {
    if (!current) return true;

    return moment().diff(current, 'days') <= 0;
  };

  return <>
    <HeadMeta title={'Add Team Member'} />
    <Section className='EditEntityBox' title={'Add Team Member'}>
      <Form className='ui form DfForm EditEntityForm'>
        <LabelledText name={fields.title} label='Title' placeholder='Your title' {...props} />

        <LabelledField name={fields.employmentType} label='Employment Type' {...props}>
          <Field component='select' name={fields.employmentType}>
            <option value=''>-</option>
            {
              employerTypesData.map((x) => <option key={x} value={x}>{x}</option>)
            }
          </Field>
        </LabelledField>

        <LabelledField name={fields.company} label='Company' {...props}>
          <div className={`atm_company_wrapper ${companyLogo && 'with_prefix'}`}>
            <Field name={fields.company}
              type={'text'}
              value={company}
              onChange={handleCompanyChange}
              autoComplete={'off'}
            />
            <div className={'atm_prefix'}>
              <img src={companyLogo} />
            </div>
          </div>
        </LabelledField>

        {/* TODO replace with Ant D. autocomplete */}
        {companyAutocomplete.map((x) => (
          <div
            className={'atm_company_autocomplete'}
            key={`${x.id}`}
            onClick={() => handleCompanyAutocomplete(x)}
          >
            <div className={'atm_company_autocomplete_item'}>
              <img src={x.img} />
              <span>{x.name}</span>
            </div>
          </div>
        ))}

        <LabelledText name={fields.location} label='Location'
          placeholder='Ex: Berlin, Germany' {...props} />

        <div className={'atm_switch_wrapper'}>
          <Switch onChange={toggleShowEndDate} checked={showEndDate} />
          <div className={'atm_switch_label'}>I am currently working in this role.</div>
        </div>

        <div className={'atm_dates_wrapper'}>

          <LabelledField name={fields.startDate} label='Start Date' {...props}>
            <DatePicker name={fields.startDate}
              value={startDate}
              onChange={(date) => setFieldValue(fields.startDate, date)}
              disabledDate={disabledStartEndDate}
            />
          </LabelledField>

          <LabelledField name={fields.endDate} label='End Date' {...props}>
          {showEndDate
            ? <div>Present</div>
            : <DatePicker name={fields.endDate}
                value={endDate}
                onChange={(date) => setFieldValue(fields.endDate, date)}
                disabledDate={disabledStartEndDate}
              />
          }
          </LabelledField>
        </div>

        <LabelledField name={fields.description} label='Description' {...props}>
          <Field component={SimpleMDEReact}
            name={fields.description}
            value={description}
            onChange={(data: string) => setFieldValue(fields.description, data)}
            className={`DfMdEditor ${errors[fields.description] && 'error'}`} />
        </LabelledField>

        {/* TODO replace with TxButton */}
        <Button type='primary' htmlType='submit' disabled={false} className={'atm_submit_button'}>
          Save
        </Button>
      </Form>
    </Section>
  </>;
};

// The type of props MyForm receives
interface MyFormProps {
  companyData: CompanyData,
  employerTypesData: string[]
}

// Wrap our form with the withFormik HoC
const Index = withFormik<MyFormProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: () => {
    return {
      title: '',
      description: '',
      employmentType: '',
      company: '',
      location: '',
      startDate: moment(new Date()).add(-1, 'days'),
      endDate: moment(),
      showEndDate: true
    };
  },

  validationSchema: buildValidationSchema,

  handleSubmit: () => {
    // console.log(values)
  },
})(InnerForm);

export default Index;
