import React from 'react';
import { EditTeamMember } from '../components/spaces/EditTeamMember';
import { suggestedCompanies, suggestedEmployerTypes } from './mocks/TeamMocks';

export default {
  title: 'Spaces | Team'
}

export const _EditTeamMember = () => {
  const props = {
    suggestedEmployerTypes,
    suggestedCompanies
  }
  return <EditTeamMember {...props} />
}
