import React from 'react'
import { configure, addDecorator } from '@storybook/react';
import '@storybook/addon-console';
// @ts-ignore
import StoryRouter from 'storybook-react-router';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import { mockNextRouter } from '../src/stories/mockNextRouter';
import { withStorybookContext } from '../src/stories/withStorybookContext';

import '../src/components/utils/styles';
import { addParameters } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

addParameters({
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
});

// Mock React router:
addDecorator(StoryRouter());

// Mock Next.js router
addDecorator(story => (
  <RouterContext.Provider value={mockNextRouter}>
    {story()}
  </RouterContext.Provider>
))

// Mock Substrate TxButton:
addDecorator(withStorybookContext)

addDecorator(story => (
  <div className='DfPageContent'>
    {story()}
  </div>
))

configure(require.context('../src', true, /\.stories\.tsx?$/), module)
