
import React from 'react';

import { withKnobs } from '@storybook/addon-knobs';
import { Button } from 'antd';

export default {
  title: 'Examples | States',
  decorators: [withKnobs]
};

export const DefaultState = () => {
  return <>DefaultState</>;
};

export const AntButton = () => {
  return <Button>Button</Button>;
};
