import React from 'react';
import { LatestSpaces } from '../components/main/LatestSpaces';
import { PageWithOnBoarding } from '../components/main/PageWrapper';
import { mockSpaceDataAlice, mockSpaceDataBob } from './mocks/SpaceMocks';

export default {
  title: 'OnBoarding | List'
}

export const _ListManySpacePreviews = () => (
  <PageWithOnBoarding>
    <LatestSpaces spacesData={[ mockSpaceDataAlice, mockSpaceDataBob, mockSpaceDataAlice ]} />
  </PageWithOnBoarding>
)
