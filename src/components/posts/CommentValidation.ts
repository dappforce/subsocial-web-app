import * as Yup from 'yup';
import { maxLenError } from '../utils/forms/validation';

export type ValidationProps = {
  // commentMinLen: U32
  commentMaxLen?: number
}

const commentMaxLen = 1000

export const buildValidationSchema = (p: ValidationProps) => Yup.object().shape({
  body: Yup.string()
    .required('Comment cannot be empty.')
    // .min(p.commentMinLen.toNumber(), minLenError('Your comment', p.commentMinLen))
    .max(p.commentMaxLen || commentMaxLen, maxLenError('Your comment', p.commentMaxLen || commentMaxLen))
})
