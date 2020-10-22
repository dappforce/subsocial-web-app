import React from 'react';
import { registerSubsocialTypes } from '../components/types';
import ClientLayout from './ClientLayout';
import { SubsocialWarnPanel } from 'src/components/utils/SubsocialWarnPanel'

const Page: React.FunctionComponent = ({ children }) => <>
    <div className='mb-3'>{children}</div>
    <SubsocialWarnPanel />
  </>

const NextLayout: React.FunctionComponent = (props) => {
  registerSubsocialTypes();

  return <ClientLayout>
    <Page {...props} />
  </ClientLayout>;
};

export default NextLayout;
