import * as Yup from 'yup';
import { minLenError, maxLenError, urlValidation } from '../utils/forms/validation';
import { U32 } from '@polkadot/types';

const SLUG_REGEX = /^[A-Za-z0-9_]+$/;

const NAME_MIN_LEN = 3;
const NAME_MAX_LEN = 100;

export type ValidationProps = {
  blogMaxLen: U32 // TODO this should be a UI const.
  slugMinLen: U32
  slugMaxLen: U32
};

export const buildValidationSchema = (p: ValidationProps) => Yup.object().shape({

  slug: Yup.string()
    .required('Slug is required')
    .matches(SLUG_REGEX, 'Slug can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).')
    .min(p.slugMinLen.toNumber(), minLenError('Slug', p.slugMinLen))
    .max(p.slugMaxLen.toNumber(), maxLenError('Slug', p.slugMaxLen)),

  name: Yup.string()
    .required('Name is required')
    .min(NAME_MIN_LEN, minLenError('Name', NAME_MIN_LEN))
    .max(NAME_MAX_LEN, maxLenError('Name', NAME_MAX_LEN)),

  image: urlValidation('Image'),

  desc: Yup.string()
    .max(p.blogMaxLen.toNumber(), maxLenError('Description', p.blogMaxLen))
})
