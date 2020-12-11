import { NextPageContext } from 'next'

export const return404 = <T>({ res }: NextPageContext) => {
  if (res) {
    res.statusCode = 404
  }
  return { statusCode: 404 } as unknown as T
}
