import * as Yup from 'yup';
import { minLenError, maxLenError, urlValidation } from '../utils/forms/validation';
import U32 from '@polkadot/types/primitive/U32';

// TODO Dprecated: deprecate this file

const HANDLE_REGEX = /^[A-Za-z0-9_]+$/;

const NAME_MIN_LEN = 3;
const NAME_MAX_LEN = 100;

export type ValidationProps = {
  spaceMaxLen?: number // TODO this should be a UI const.
  handleMinLen: U32
  handleMaxLen: U32
};

const spaceMaxLen = 10000;

export const buildValidationSchema = (p: ValidationProps) => Yup.object().shape({

  handle: Yup.string()
    .matches(HANDLE_REGEX, 'Handle can have only letters (a-z, A-Z), numbers (0-9) and underscores (_)')
    .min(p.handleMinLen.toNumber(), minLenError('Handle', p.handleMinLen))
    .max(p.handleMaxLen.toNumber(), maxLenError('Handle', p.handleMaxLen)),

  name: Yup.string()
    .required('Name is required')
    .min(NAME_MIN_LEN, minLenError('Name', NAME_MIN_LEN))
    .max(NAME_MAX_LEN, maxLenError('Name', NAME_MAX_LEN)),

  image: urlValidation('Avatar'),

  desc: Yup.string()
    .max(p.spaceMaxLen || spaceMaxLen, maxLenError('Description', p.spaceMaxLen || spaceMaxLen))
})
