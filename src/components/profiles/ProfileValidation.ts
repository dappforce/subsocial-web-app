import * as Yup from 'yup';
import { minLenError, maxLenError, urlValidation } from '../utils/forms/validation';
import U32 from '@polkadot/types/primitive/U32';

const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;

const FULLNAME_MIN_LEN = 2;
const FULLNAME_MAX_LEN = 100;

const ABOUT_MAX_LEN = 1000;


export type ValidationProps = {
  usernameMinLen: U32
  usernameMaxLen: U32
}

export const buildValidationSchema = (p: ValidationProps) => Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .matches(USERNAME_REGEX, 'Username can have only letters (a-z, A-Z), numbers (0-9), underscores (_).')
    .min(p.usernameMinLen.toNumber(), minLenError('Username', p.usernameMinLen))
    .max(p.usernameMaxLen.toNumber(), maxLenError('Username', p.usernameMaxLen)),

  fullname: Yup.string()
    .min(FULLNAME_MIN_LEN, minLenError('Full name', FULLNAME_MIN_LEN))
    .max(FULLNAME_MAX_LEN, maxLenError('Full name', FULLNAME_MAX_LEN)),

  about: Yup.string()
    .max(ABOUT_MAX_LEN, maxLenError('Text', ABOUT_MAX_LEN)),

  email: Yup.string()
    .email('Enter a correct email address'),

  avatar: urlValidation('Avatar'),
  personalSite: urlValidation('Personal site'),
  facebook: urlValidation('Facebook'),
  twitter: urlValidation('Twitter'),
  linkedIn: urlValidation('LinkedIn'),
  medium: urlValidation('Medium'),
  github: urlValidation('GitHub'),
  instagram: urlValidation('Instagram')
})