import React, { useEffect, useState } from 'react';
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { Loading } from '../utils/utils';
import NoData from '../utils/EmptyList';
import { BlogData, ProfileData } from '@subsocial/types/dto'
import { ViewBlogProps } from './ViewBlogProps';

type Props = ViewBlogProps

export const withLoadBlogDataById = (Component: React.ComponentType<Props>) => {
  return (props: Props) => {
    const { id } = props

    if (!id) return <NoData description={<span>Blog id is undefined</span>} />

    const { subsocial } = useSubsocialApi()
    const [ blogData, setBlogData ] = useState<BlogData>()
    const [ owner, setOwner ] = useState<ProfileData>()

    useEffect(() => {
      const loadData = async () => {
        const blogData = await subsocial.findBlog(id)
        if (blogData) {
          setBlogData(blogData)
          const ownerId = blogData.struct.created.account
          const owner = await subsocial.findProfile(ownerId)
          setOwner(owner);
        }
      }
      loadData()
    }, [ false ])

    return blogData?.content
      ? <Component blogData={blogData} owner={owner} {...props}/>
      : <Loading />
  }
}

export default withLoadBlogDataById
