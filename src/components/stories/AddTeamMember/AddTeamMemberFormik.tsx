import React, {useState} from 'react';
import {withFormik, FormikProps, Form, Field} from 'formik';
import * as DfForms from '../../utils/forms';
import SimpleMDEReact from "react-simplemde-editor";
import {Switch, DatePicker, Button} from 'antd';
import {Moment} from "moment-timezone/moment-timezone";
import moment from "moment-timezone";
import * as Yup from "yup";
import HeadMeta from "../../utils/HeadMeta";
import Section from "../../utils/Section";

import './addTeamMember.css';

const LabelledField = DfForms.LabelledField<FormValues>();
const LabelledText = DfForms.LabelledText<FormValues>();

// Shape of form values
interface FormValues {
    title: string,
    employment_type: string,
    company: string
    location: string
    startDate: Moment
    endDate: Moment
    description: any,
    switchField: boolean
}

interface OtherProps {
    message: string;
}

type Company = { id: number, name: string, img: string };
type CompanyData = Array<Company>;


// Aside: You may see InjectedFormikProps<OtherProps, FormValues> instead of what comes below in older code.. InjectedFormikProps was artifact of when Formik only exported a HoC. It is also less flexible as it MUST wrap all props (it passes them through).
const InnerForm = (props: OtherProps & FormikProps<FormValues>) => {
    const {
        values,
        errors,
        setFieldValue,
    } = props;

    const {
        description,
        company,
        startDate,
        endDate,
        switchField
    } = values;

    const [companyPrefix, setCompanyPrefix] = useState('');
    const [companyAutocomplete, setCompanyAutocomplete] = useState<CompanyData>([]);

    console.log('Prefix: ', companyPrefix);

    const handleCompanyChange = (e: React.FormEvent<HTMLInputElement>) => {
        let companyData: CompanyData = [{
            id: 0,
            name: "Web3 Foundation",
            img: 'https://pbs.twimg.com/profile_images/1162751266432442369/cjjjE5un_400x400.png'
        }];

        if (!e.currentTarget.value) {
            setCompanyAutocomplete([]);
        }

        setFieldValue('company', e.currentTarget.value);
        setCompanyPrefix('');

        if (company) {
            company.toLowerCase();

            let results = companyData.filter(function (item) {
                return item.name.toLowerCase().includes(company);
            });

            if (results) setCompanyAutocomplete(results);
        }
    };

    let handleAutocomplete = (data: Company) => {
        setFieldValue('company', data.name);

        setCompanyAutocomplete([]);
        setCompanyPrefix(data.img);
    };

    let handleSwitch = () => {
        setFieldValue('switchField', !switchField);
    };

    let disabledStartDate = (current: Moment | null) => {
        if (current === null) return true;
        return moment().diff(current, 'days') <= 0;
    };

    let disabledEndDate = (current: Moment | null) => {
        if (current === null) return true;
        return moment().diff(current, 'days') > 0;
    };

    return (
        <>
            <HeadMeta title={'Add Team Member'}/>
            <Section className='EditEntityBox' title={'Add Team Member'}>
                <Form className='ui form DfForm EditEntityForm'>
                    <LabelledText name='title' label='Title' placeholder='Your title' {...props} />

                    <LabelledField name='employment_type' label='Employment Type' {...props}>
                        <Field component="select" name="employment_type">
                            <option value="">-</option>
                            <option value="type1">type1</option>
                            <option value="type2">type2</option>
                            <option value="type3">type3</option>
                        </Field>
                    </LabelledField>

                    <LabelledField name='company' label='Company' {...props}>
                        <Field name="company"
                               type={'text'}
                               value={company}
                               onChange={handleCompanyChange}
                        />
                    </LabelledField>
                    {companyAutocomplete.map((i) => {
                        return (
                            <div className={'atm_company_autocomplete'}
                                 key={`${i.id}`}
                                 onClick={() => handleAutocomplete(i)}
                            >
                                <img src={i.img}/>
                                <span>{i.name}</span>
                            </div>
                        );
                    })}

                    <LabelledText name='location' label='Location'
                                  placeholder='Ex: London, United Kingdom' {...props} />

                    <div className={'atm_switch_wrapper'}>
                        <Switch onChange={handleSwitch} checked={switchField}/>
                        <div className={'atm_switch_label'}>I am currently working in this role.</div>
                    </div>

                    <div className={'atm_dates_wrapper'}>

                        <LabelledField name='startDate' label='Start Date' {...props}>
                            <DatePicker name={'startDate'}
                                        value={startDate}
                                        onChange={(date) => setFieldValue('startDate', date)}
                                        disabledDate={disabledStartDate}
                            />
                        </LabelledField>


                        {switchField === true ?
                            <LabelledField name='endDate' label='End Date' {...props}>
                                <div>Present</div>
                            </LabelledField>
                            :
                            <LabelledField name='endDate' label='End Date' {...props}>
                                <DatePicker name={'endDate'}
                                            value={endDate}
                                            onChange={(date) => setFieldValue('endDate', date)}
                                            disabledDate={disabledEndDate}
                                />
                            </LabelledField>
                        }
                    </div>

                    <LabelledField name='description' label='Description' {...props}>
                        <Field component={SimpleMDEReact}
                               name='description'
                               value={description}
                               onChange={(data: string) => setFieldValue('description', data)}
                               className={`DfMdEditor ${errors['description'] && 'error'}`}/>
                    </LabelledField>

                    <Button type="primary" htmlType="submit" disabled={false} className={'atm_submit_button'}>
                        Save
                    </Button>
                </Form>
            </Section>
        </>
    );
};


// Validation
const TITLE_REGEX = /^[A-Za-z0-9_-]+$/;
const TITLE_MIN_LEN = 2;
const TITLE_MAX_LEN = 50;

const COMPANY_MIN_LEN = 2;
const COMPANY_MAX_LEN = 50;

const LOCATION_MIN_LEN = 2;
const LOCATION_MAX_LEN = 50;

const DESCRIPTION_MAX_LEN = 5000;

const buildSchema = () => Yup.object().shape({
    title: Yup.string()
        .required('Title is required')
        .matches(TITLE_REGEX, 'Title can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).')
        .min(TITLE_MIN_LEN, `Title is too short. Minimum length is ${TITLE_MIN_LEN} chars.`)
        .max(TITLE_MAX_LEN, `Title is too long. Maximum length is ${TITLE_MAX_LEN} chars.`),
    company: Yup.string()
        .required('Company name is required')
        .min(COMPANY_MIN_LEN, `Company name is too short. Minimum length is ${COMPANY_MIN_LEN} chars.`)
        .max(COMPANY_MAX_LEN, `Company name is too long. Maximum length is ${COMPANY_MAX_LEN} chars.`),
    location: Yup.string()
        .min(LOCATION_MIN_LEN, `Location is too short. Minimum length is ${LOCATION_MIN_LEN} chars.`)
        .max(LOCATION_MAX_LEN, `Location is too long. Maximum length is ${LOCATION_MAX_LEN} chars.`),
    startDate: Yup.object().test(
        "startDate",
        "Start date should not be in future",
        value => {
            return moment().diff(value, 'days') >= 0;
        }
    ),
    endDate: Yup.object().test(
        "endDate",
        "End date should not be in past",
        value => {
            return value ? moment().diff(value, 'days') <= 0 : true;
        }
    ),
    description: Yup.string()
        .max(DESCRIPTION_MAX_LEN, `Description is too long. Maximum length is ${DESCRIPTION_MAX_LEN} chars.`),
});

// The type of props MyForm receives
interface MyFormProps {
    initialTitle?: string;
    message: string; // if this passed all the way through you might do this or make a union type
}

// Wrap our form with the withFormik HoC
const MyForm = withFormik<MyFormProps, FormValues>({
    // Transform outer props into form values
    mapPropsToValues: props => {
        return {
            title: props.initialTitle || '',
            description: '',
            employment_type: '',
            company: '',
            location: '',
            startDate: moment(new Date()).add(-1, 'days'),
            endDate: moment(),
            switchField: true
        };
    },

    validationSchema: buildSchema,

    handleSubmit: values => {
        console.log(values)
    },
})(InnerForm);

// Use <MyForm /> wherevs
const AddTeamMemberFormik = () => (
    <MyForm message="Sign up"/>
);

export default AddTeamMemberFormik;