import React from 'react'
import { EditForm } from '../components/spaces/EditSpace'
import { mockSpaceId, mockSpaceStruct, mockSpaceJson, mockSpaceValidation } from './mocks/SpaceMocks'

export default {
  title: 'Spaces | Edit'
}

export const _NewSpace = () =>
  <EditForm {...mockSpaceValidation} />

export const _EditSpace = () =>
  <EditForm id={mockSpaceId} struct={mockSpaceStruct} json={mockSpaceJson} {...mockSpaceValidation} />
