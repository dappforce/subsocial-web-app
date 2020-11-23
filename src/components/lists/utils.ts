import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'

type ParamsHookProps = {
  triggers?: any[]
  defaultSize: number
}

export const useLinkParams = ({ triggers = [], defaultSize }: ParamsHookProps) => {
  const { pathname, asPath } = useRouter()

  return useCallback((page: number, currentSize?: number) => {
    const size = currentSize || defaultSize
    const sizeParam = size && size !== DEFAULT_PAGE_SIZE ? `&size=${size}` : ''
    const pageParam = page !== DEFAULT_FIRST_PAGE ? `page=${page}` : ''
    const params = `${pageParam}${sizeParam}`
    const query = params ? `?${params}` : ''
    return {
      href: `${pathname}${query}`,
      as: `${asPath.split('?')[0]}${query}`
    }
  }, [ pathname, asPath, ...triggers ])
}
