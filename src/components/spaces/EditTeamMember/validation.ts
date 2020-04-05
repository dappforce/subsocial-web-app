import * as Yup from 'yup';
import moment from 'moment-timezone';
import { minLenError, maxLenError } from '../../utils/forms/validation';

const TITLE_MIN_LEN = 2;
const TITLE_MAX_LEN = 50;

const COMPANY_MIN_LEN = 2;
const COMPANY_MAX_LEN = 50;

const LOCATION_MIN_LEN = 2;
const LOCATION_MAX_LEN = 100;

const DESCRIPTION_MAX_LEN = 2000;

export const buildValidationSchema = () => Yup.object().shape({
  title: Yup.string()
    .required('Job title is required')
    .min(TITLE_MIN_LEN, minLenError('Job title', TITLE_MIN_LEN))
    .max(TITLE_MAX_LEN, maxLenError('Job title', TITLE_MAX_LEN)),

  company: Yup.string()
    .required('Company name is required')
    .min(COMPANY_MIN_LEN, minLenError('Company name', COMPANY_MIN_LEN))
    .max(COMPANY_MAX_LEN, maxLenError('Company name', COMPANY_MAX_LEN)),

  location: Yup.string()
    .min(LOCATION_MIN_LEN, minLenError('Location name', LOCATION_MIN_LEN))
    .max(LOCATION_MAX_LEN, maxLenError('Location name', LOCATION_MAX_LEN)),

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
    .max(DESCRIPTION_MAX_LEN, maxLenError('Description', DESCRIPTION_MAX_LEN))
})
