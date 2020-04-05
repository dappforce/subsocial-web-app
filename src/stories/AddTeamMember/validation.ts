import * as Yup from 'yup';
import moment from 'moment-timezone';
// import { minLenError, maxLenError } from '../utils/forms/validation';

const TITLE_MIN_LEN = 2;
const TITLE_MAX_LEN = 50;

const COMPANY_MIN_LEN = 2;
const COMPANY_MAX_LEN = 50;

const LOCATION_MIN_LEN = 2;
const LOCATION_MAX_LEN = 50;

const DESCRIPTION_MAX_LEN = 5000;

export const buildValidationSchema = () => Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
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
    'startDate',
    'Start date should not be in future',
    value => moment().diff(value, 'days') >= 0
  ),

  endDate: Yup.object().test(
    'endDate',
    'End date should not be in future',
    value => value ? moment().diff(value, 'days') >= 0 : true
  ),

  description: Yup.string()
    .max(DESCRIPTION_MAX_LEN, `Description is too long. Maximum length is ${DESCRIPTION_MAX_LEN} chars.`),
})
