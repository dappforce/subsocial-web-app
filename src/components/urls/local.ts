import { appBaseUrl } from '../utils/env'

export const fullUrl = (relative: string) => {
  if (relative.startsWith(appBaseUrl)) return relative

  const base = appBaseUrl.endsWith('/') ? appBaseUrl : appBaseUrl + '/'
  const pathname = relative.startsWith('/') ? relative.substr(1) : relative

  console.log(base, pathname)

  return base + pathname
} 