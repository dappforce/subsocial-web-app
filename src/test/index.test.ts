import { fullUrl } from '../components/urls/helpers'
import { appBaseUrl } from '../components/utils/env'

test('Url', () => {
  const relativePath = '/spaces/all'
  const url = fullUrl(relativePath)

  expect(url).toBe(`${appBaseUrl}${relativePath}`)
})