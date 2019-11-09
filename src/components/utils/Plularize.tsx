import React from 'react';
import BN from 'bn.js';

type PluralizeProps = {
  count: number | BN | string,
  singularText: string,
  pluralText?: string
};

const ZERO = new BN(0);
const ONE = new BN(1);

export function Pluralize (props: PluralizeProps) {
  let { count, singularText, pluralText } = props;

  if (!count) {
    count = ZERO;
  } else if (!(count instanceof BN)) {
    count = new BN(count);
  }

  const plural = () => !pluralText
    ? singularText + 's'
    : pluralText;

  const text = count.eq(ONE)
    ? singularText
    : plural();

  return <>{count.toString()} {text}</>;
}
