import { EntityId } from '@reduxjs/toolkit'
import { Button } from 'antd'
import { NextPage } from 'next'
import React, { FC, useState } from 'react'
import { PageContent } from 'src/components/main/PageWrapper'
import { Section } from 'src/components/utils/Section'
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { HasInitialReduxState, initializeStore } from 'src/rtk/app/store'
import { tryParseInt } from 'src/utils'
import { useFetchPosts } from '../posts/postsHooks'
import { fetchPosts } from '../posts/postsSlice'

type Props = HasInitialReduxState & {
  ids?: EntityId[]
}

export const SpacesList: FC<Props> = ({ ids: initialIds = [] }) => {
  // const [ spaceIds, setSpaceIds ] = useState([ '1002', '1003', '1004' ])
  // const spaces = useFetchSpaces(spaceIds)

  const [ ids, setIds ] = useState(initialIds)
  const posts = useFetchPosts(ids)

  const lastId = !ids.length ? 0 : tryParseInt(ids[ids.length - 1], 0)
  const nextId = lastId + 1

  return (
    <PageContent meta={{ title: 'Redux' }}>
      <Button onClick={() => setIds(ids.concat('' + nextId))}>Add id</Button>
      <Section title='Space ids'>
        {JSON.stringify(ids)}
      </Section>
      <Section title='Posts'>
        <pre>
          {JSON.stringify(posts, null, 2)}
        </pre>
      </Section>
      {/* <Section title='Spaces'>
        <pre>
          {JSON.stringify(spaces, null, 2)}
        </pre>
      </Section> */}
    </PageContent>
  )
}

const samplePostIds = [ '1', '100', '200' ]

export const SpacesListPage: NextPage<Props> = (props) => {
  return <SpacesList {...props} />
}

SpacesListPage.getInitialProps = async ({}): Promise<Props> => {
  const reduxStore = initializeStore()
  const { dispatch } = reduxStore
  
  const subsocial = await getSubsocialApi()
  await dispatch(fetchPosts({ api: subsocial, ids: samplePostIds }))
  const initialReduxState = reduxStore.getState()

  return { initialReduxState, ids: samplePostIds }
}

// // Alternative way to fetch data on server-side:
// export const getServerSideProps: GetServerSideProps<Props> = async ({}) => {
//   const reduxStore = initializeStore()
//   const { dispatch } = reduxStore
  
//   const subsocial = await getSubsocialApi()
//   await dispatch(fetchPosts({ api: subsocial, ids: samplePostIds }))
//   const initialReduxState = reduxStore.getState()

//   return { props: { initialReduxState, ids: samplePostIds } }
// }

// export default SpacesList
