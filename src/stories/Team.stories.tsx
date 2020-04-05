import React from 'react';
import { withStorybookContext } from './withStorybookContext';
import { EditTeamMember } from '../components/spaces/EditTeamMember';
import { suggestedCompanies, suggestedEmployerTypes } from './mocks/TeamMocks';

export default {
  title: 'Spaces | Team',
  decorators: [ withStorybookContext ]
}

export const _EditTeamMember = () => {
  const props = {
    suggestedEmployerTypes,
    suggestedCompanies
  }
  return <EditTeamMember {...props} />
}
