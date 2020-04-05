import * as Yup from 'yup';
import BN from 'bn.js';
import { pluralize } from '../Plularize';

export function minLenError (fieldName: string, minLen: number | BN): string {
  return `${fieldName} is too short. Minimum length is ${pluralize(minLen, 'char')}.`
}

export function maxLenError (fieldName: string, maxLen: number | BN): string {
  return `${fieldName} is too long. Maximum length is ${pluralize(maxLen, 'char')}.`
}

const URL_MAX_LEN = 2000;

export function urlValidation (urlName: string) {
  return Yup.string()
    .url(`${urlName} must be a valid URL.`)
    .max(URL_MAX_LEN, `${urlName} URL is too long. Maximum length is ${URL_MAX_LEN} chars.`);
}
