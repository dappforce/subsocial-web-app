import React from 'react';
import axios from 'axios';
import { Button } from 'antd';
import { MultiOwnership } from '../components/spaces/MultiOwnership';
import { data } from './mocks/MultiOwnershipMocks';
import { previewImage } from 'antd/lib/upload/utils';

export default {
  title: 'Spaces | Team | MultiOwnership'
}

export const _MultiOwnership = () => <MultiOwnership data={data}/>;
