import React from 'react';
import { StorybookProvider } from './StoribookContext';

export const withStorybookContext = (storyFn: () => React.ReactElement) =>
  <StorybookProvider>{storyFn()}</StorybookProvider>
