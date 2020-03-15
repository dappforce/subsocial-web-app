import React from 'react'
import { configure, addDecorator } from '@storybook/react';
import '@storybook/addon-console';
import StoryRouter from 'storybook-react-router';

import '../src/components/utils/styles';
import './style.css';

addDecorator(StoryRouter());

addDecorator(story => (
  <div className='StorybookRoot'>
    {story()}
  </div>
));

configure(require.context('../src', true, /\.stories\.tsx?$/), module)
