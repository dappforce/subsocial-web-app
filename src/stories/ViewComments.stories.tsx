import React from 'react';
import { ViewComment } from '../components/posts/NewViewComment'
import { mockProfileDataAlice } from './mocks/SocialProfileMocks';
import { mockAccountAlice } from './mocks/AccountMocks'
import { mockPostStruct, mockPostJson } from './mocks/PostMocks'

export default {
  title: 'Comments'
}

const ViewCommentMock: React.FunctionComponent = ({ children }) => <ViewComment address={mockAccountAlice} owner={mockProfileDataAlice} struct={mockPostStruct} content={mockPostJson}>{children}</ViewComment>

export const CommentsTree = () => (
  <>
    <ViewCommentMock>
      <ViewCommentMock>
        <ViewCommentMock />
        <ViewCommentMock />
      </ViewCommentMock>
    </ViewCommentMock>
    <ViewCommentMock />
    <ViewCommentMock />
  </>
)

export const OneComment = () => (
  <ViewCommentMock />
)
