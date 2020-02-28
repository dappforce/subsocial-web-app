import React from 'react';
import { StorybookProvider } from './StorybookContext';

export const withStorybookContext = (storyFn: () => React.ReactElement) =>
  <StorybookProvider>{storyFn()}</StorybookProvider>
