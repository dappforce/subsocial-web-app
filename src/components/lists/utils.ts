import { useCallback } from "react"
import { useRouter } from "next/router"

type ParamsHookProps = {
  triggers?: any[]
  defaultSize: number
}

export const useLinkParams = ({ triggers = [], defaultSize }: ParamsHookProps) => {
  const { pathname, asPath } = useRouter()

  return useCallback((page: number, size?: number) => {
    const query = `page=${page}&size=${size || defaultSize}`
    return {
      href: `${pathname}?${query}`,
      as: `${asPath.split('?')[0]}?${query}`
    }
  }, [ pathname, asPath, ...triggers ])
}
