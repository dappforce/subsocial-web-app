import * as Yup from 'yup';
import { urlValidation, minLenError, maxLenError } from '../../utils/forms/validation';
import { pluralize } from '@subsocial/utils';

const MAX_TAGS = 10

const MIN_BLOCKS = 1
const MAX_BLOCKS = 100

const TEXT_BLOCK_MIN_LEN = 1
const TEXT_BLOCK_MAX_LEN = 100 * 1024 // 100 KB

const TextBlockSchema = Yup.string()
  .min(TEXT_BLOCK_MIN_LEN, minLenError('Text block', TEXT_BLOCK_MIN_LEN))
  .max(TEXT_BLOCK_MAX_LEN, maxLenError('Text block', TEXT_BLOCK_MAX_LEN))

const buildSchema = () => Yup.object().shape({
  title: Yup.string()
    .required('Post title is required'),

  tags: Yup.array()
    .max(MAX_TAGS, `Post can have ${pluralize(MAX_TAGS, 'tag')} max.`),

  canonical: urlValidation('Original post URL'),

  blockValues: Yup.array()
    .of(
      Yup.object({
        kind: Yup.string(),
        data: Yup.string()
          .when('kind', {
            is: (val) => val === 'text',
            then: TextBlockSchema,
            otherwise: Yup.string()
          })
      })
    )
    .min(MIN_BLOCKS, `Post should have at least ${pluralize(MIN_BLOCKS, 'block')}.`)
    .max(MAX_BLOCKS, `Post can have ${pluralize(MAX_BLOCKS, 'block')} max.`)
});

export default buildSchema
