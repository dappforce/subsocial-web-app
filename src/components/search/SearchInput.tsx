import React, { useState, useEffect } from 'react'
import { Input } from 'antd'
import { nonEmptyStr } from '@subsocial/utils'
import { useRouter } from 'next/router'
import { isMobileDevice } from 'src/config/Size.config'

const { Search } = Input

const SearchInput = () => {
  const router = useRouter()
  const [ searchValue, setSearchValue ] = useState<string | undefined>(router.query.q as string)
  const isSearchPage = router.pathname.includes('search')

  useEffect(() => {
    if (isSearchPage) return

    setSearchValue(undefined)
  }, [ isSearchPage ])

  const onSearch = (value: string) => {
    const queryPath = {
      pathname: '/search',
      query: {
        ...router.query,
        q: value
      }
    }
    return nonEmptyStr(value) && router.replace(queryPath, queryPath)
  }

  const onChange = (value: string) => setSearchValue(value)

  return (
    <div className={'DfSearch'}>
      <Search
        placeholder="Search for spaces, posts or comments"
        onSearch={onSearch}
        value={searchValue}
        autoFocus={isMobileDevice}
        onChange={e => onChange(e.currentTarget.value)}
      />
    </div>
  )
}

export default SearchInput
