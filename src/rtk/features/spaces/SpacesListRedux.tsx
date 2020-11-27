import { Button } from 'antd'
import React, { useState } from 'react'
import { PageContent } from 'src/components/main/PageWrapper'
import { Section } from 'src/components/utils/Section'
import { useFetchSpacesByIds } from './spacesHooks'

export const SpacesList = () => {
  const [ spaceIds, setSpaceIds ] = useState([ '1002', '1003', '1004' ])
  const spaces = useFetchSpacesByIds(spaceIds)

  const nextId = parseInt(spaceIds[spaceIds.length - 1]) + 1

  return (
    <PageContent meta={{ title: 'Spaces List (Redux)' }}>
      <Button onClick={() => setSpaceIds(spaceIds.concat('' + nextId))}>Add id</Button>
      <Section title='Space ids'>
        {JSON.stringify(spaceIds)}
      </Section>
      <Section title='Space Structs'>
        <pre>
          {JSON.stringify(spaces, null, 2)}
        </pre>
      </Section>
    </PageContent>
  )
}

export default SpacesList
