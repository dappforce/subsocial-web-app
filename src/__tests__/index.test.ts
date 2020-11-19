import { fullUrl } from '../components/urls/local'
import { appBaseUrl } from '../components/utils/env'

test('Relative path with "/"', async () => {
  const relativePath = '/test/test'
  const url = fullUrl(relativePath)

  expect(url).toBe(`${appBaseUrl}${relativePath}`)
})

test('Relative path without "/"', () => {
  let relativePath = 'test/test'
  const url = fullUrl(relativePath)
  relativePath = '/' + relativePath

  expect(url).toBe(`${appBaseUrl}${relativePath}`)
})

test('Absolute path', () => {
  const absolutePath = `${appBaseUrl}/test/test`
  const url = fullUrl(absolutePath)

  expect(url).toBe(absolutePath)
})