import React from 'react';
import { StorybookProvider } from '../components/utils/StorybookContext';

export const withStorybookContext = (storyFn: () => React.ReactElement) =>
  <StorybookProvider>{storyFn()}</StorybookProvider>
