import BN from 'bn.js'

/** `def` is a default number that will be returned in case the fuction fails to parse `maybeNum` */
export const tryParseInt = (maybeNum: string | number, def: number): number => {
  if (typeof maybeNum === 'number') {
    return maybeNum
  }
  try {
    return parseInt(maybeNum)
  } catch (err) {
    return def
  }
}

// TODO get rid of this function once we move from BN ids to string ids.
export function stringifyBns (ids: BN[]): string[] {
  return ids.map(id => id?.toString())
}