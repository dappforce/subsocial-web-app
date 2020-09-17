import * as Yup from 'yup';
import { minLenError, maxLenError, urlValidation } from '../utils/forms/validation';
import U32 from '@polkadot/types/primitive/U32';

const FULLNAME_MIN_LEN = 2;
const FULLNAME_MAX_LEN = 100;

const ABOUT_MAX_LEN = 1000;

export type ValidationProps = {
  handleMinLen: U32
  handleMaxLen: U32
}

export const buildValidationSchema = (p: ValidationProps) => Yup.object().shape({
  name: Yup.string()
    .min(FULLNAME_MIN_LEN, minLenError('Full name', FULLNAME_MIN_LEN))
    .max(FULLNAME_MAX_LEN, maxLenError('Full name', FULLNAME_MAX_LEN)),

  about: Yup.string()
    .max(ABOUT_MAX_LEN, maxLenError('About', ABOUT_MAX_LEN)),

  email: Yup.string()
    .email('Enter a correct email address'),

  avatar: urlValidation('Avatar'),
  website: urlValidation('Website'),
  facebook: urlValidation('Facebook'),
  twitter: urlValidation('Twitter'),
  linkedIn: urlValidation('LinkedIn'),
  medium: urlValidation('Medium'),
  github: urlValidation('GitHub'),
  instagram: urlValidation('Instagram')
})
