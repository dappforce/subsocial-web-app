import { NextPageContext } from 'next'

export const return404 = ({ res }: NextPageContext) => {
  if (res) {
    res.statusCode = 404
  }
  return { statusCode: 404 }
}
