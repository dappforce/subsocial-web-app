import { Button } from 'antd'
import React, { useState } from 'react'
import { PageContent } from 'src/components/main/PageWrapper'
import { Section } from 'src/components/utils/Section'
import { useFetchPostsByIds } from '../posts/postsHooks'
import { useFetchSpacesByIds } from './spacesHooks'

export const SpacesList = () => {
  // const [ spaceIds, setSpaceIds ] = useState([ '1002', '1003', '1004' ])
  // const spaces = useFetchSpacesByIds(spaceIds)

  const [ ids, setIds ] = useState([ '1', '100', '200' ])
  const posts = useFetchPostsByIds(ids)

  const nextId = parseInt(ids[ids.length - 1]) + 1

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

export default SpacesList
