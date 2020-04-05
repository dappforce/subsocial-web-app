import React from 'react';
import { StorybookProvider } from '../utils/StorybookContext';

export const withStorybookContext = (storyFn: () => React.ReactElement) =>
  <StorybookProvider>{storyFn()}</StorybookProvider>
