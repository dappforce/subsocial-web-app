import * as Yup from 'yup';

export type ValidationProps = {
  // TODO this should be a UI const.
}

const MAX_TAGS_PER_POST = 10
const MIN_TEXT_BLOCK_LENGTH = 1
const MIN_BLOCKS = 1

const buildSchema = () => Yup.object().shape({
  title: Yup.string()
    .required('Post title is required'),
  tags: Yup.array()
    .max(MAX_TAGS_PER_POST, `Too many tags. Maximum: ${MAX_TAGS_PER_POST}`),
  canonical: Yup.string()
    .url('Canonical must be a valid URL.'),
  blockValues: Yup.array()
    .of(
      Yup.object({
        kind: Yup.string(),
        data: Yup.string()
          .when('kind', {
            is: (val) => val === 'text',
            then: Yup.string().min(MIN_TEXT_BLOCK_LENGTH, `Text must be at least ${MIN_TEXT_BLOCK_LENGTH} characters`),
            otherwise: Yup.string()
          })
      })
    )
    .min(MIN_BLOCKS, `Post should have at least ${MIN_BLOCKS} block`)
});

export default buildSchema
