import * as Yup from 'yup';
import { maxLenError } from '../utils/forms/validation';
import { U32 } from '@polkadot/types';

export type ValidationProps = {
  // commentMinLen: U32
  commentMaxLen: U32
}

export const buildValidationSchema = (p: ValidationProps) => Yup.object().shape({
  body: Yup.string()
    .required('Comment cannot be empty.')
    // .min(p.commentMinLen.toNumber(), minLenError('Your comment', p.commentMinLen))
    .max(p.commentMaxLen.toNumber(), maxLenError('Your comment', p.commentMaxLen))
})
