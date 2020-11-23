import React from 'react'
import { LatestSpaces } from '../components/main/LatestSpaces'
import { mockSpaceDataAlice, mockSpaceDataBob } from './mocks/SpaceMocks'

export default {
  title: 'Spaces | List'
}

export const _NoSpacePreviews = () =>
  <LatestSpaces spacesData={[]} />

export const _ListOneSpacePreview = () =>
  <LatestSpaces spacesData={[ mockSpaceDataAlice ]} />

export const _ListManySpacePreviews = () =>
  <LatestSpaces spacesData={[ mockSpaceDataAlice, mockSpaceDataBob, mockSpaceDataAlice ]} />
