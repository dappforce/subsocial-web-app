/** `def` is a default number that will be returned in case the fuction fails to parse `maybeNum` */
export const tryParseInt = (maybeNum: string, def: number): number => {
  try {
    return parseInt(maybeNum)
  } catch (err) {
    return def
  }
}
