import * as Yup from 'yup';
import { maxLenError, minLenError, urlValidation } from '../utils/forms/validation';
import { pluralize } from '../utils/Plularize';

const TITLE_MIN_LEN = 3;
const TITLE_MAX_LEN = 100;

const MAX_TAGS_PER_POST = 10

export type ValidationProps = {
  postMaxLen?: number // TODO this should be a UI const.
}

const postMaxLen = 10000;

export const buildValidationSchema = (p: ValidationProps) => Yup.object().shape({
  title: Yup.string()
    // .required('Post title is required')
    .min(TITLE_MIN_LEN, minLenError('Post title', TITLE_MIN_LEN))
    .max(TITLE_MAX_LEN, maxLenError('Post title', TITLE_MAX_LEN)),

  body: Yup.string()
    .required('Post body is required')
    // .min(p.minTextLen.toNumber(), minLenError('Post body', p.postMinLen))
    .max(p.postMaxLen || postMaxLen, maxLenError('Post body', p.postMaxLen || postMaxLen)),

  image: urlValidation('Image'),

  tags: Yup.array()
    .max(MAX_TAGS_PER_POST, `Too many tags. You can use up to ${pluralize(MAX_TAGS_PER_POST, 'tag')} per post.`),

  canonical: urlValidation('Original post')
})
