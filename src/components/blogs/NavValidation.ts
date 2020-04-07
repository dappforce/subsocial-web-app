import * as Yup from 'yup';
import { minLenError, maxLenError } from '../utils/forms/validation';

const TITLE_MIN_LEN = 2;
const TITLE_MAX_LEN = 50;

export const validationSchema = Yup.object().shape({
  navTabs: Yup.array().of(
    Yup.object().shape({
      title: Yup.string()
        .min(TITLE_MIN_LEN, minLenError('Tab title', TITLE_MIN_LEN))
        .max(TITLE_MAX_LEN, maxLenError('Tab title', TITLE_MAX_LEN))
        .required('Tab title is a required field')
    })
  )
})
