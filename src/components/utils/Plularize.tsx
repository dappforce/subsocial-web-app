import React from 'react';
import { hexToBn } from '@polkadot/util';
import BN from 'bn.js';

type PluralizeProps = {
  count: number | BN | string,
  singularText: string,
  pluralText?: string
};

const ZERO = new BN(0);
const ONE = new BN(1);

export function pluralize (
  count: number | BN | string,
  singularText: string,
  pluralText?: string
) {
  if (!count) {
    count = ZERO;
  } else if (typeof count === 'string') {

    if (count.startsWith('0x')) {
      count = hexToBn(count);
    } else if (count.startsWith('-0x')) {
      count = hexToBn(count.substring(1), { isNegative: true });
    } else {
      count = new BN(count);
    }

  } else if (typeof count === 'number') {
    count = new BN(count);
  }

  const plural = () => !pluralText
    ? singularText + 's'
    : pluralText;

  const text = count.eq(ONE)
    ? singularText
    : plural();

  return `${count.toNumber()} ${text}`;
}

export function Pluralize (props: PluralizeProps) {
  const { count, singularText, pluralText } = props;
  return <>{pluralize(count, singularText, pluralText)}</>;
}
