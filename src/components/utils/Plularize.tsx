import React from 'react'
import { pluralize } from '@subsocial/utils'
import BN from 'bn.js'

type PluralizeProps = {
  count: number | BN | string,
  singularText: string,
  pluralText?: string
};

export { pluralize }

export function Pluralize (props: PluralizeProps) {
  const { count, singularText, pluralText } = props
  return <>{pluralize(count, singularText, pluralText)}</>
}
