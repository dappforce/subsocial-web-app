// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IdentityProps as Props } from '@polkadot/react-identicon/types';

import React from 'react';
import BaseIdentityIcon from '@polkadot/react-identicon';
import Avatar from 'antd/lib/avatar/avatar';
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config';

export function getIdentityTheme (): 'substrate' {
  return 'substrate';
}

export function IdentityIcon ({ prefix, theme, value, size = DEFAULT_AVATAR_SIZE, ...props }: Props): React.ReactElement<Props> {
  const address = value?.toString() || '';
  const thisTheme = theme || getIdentityTheme();

  return (
    <Avatar
      icon={<BaseIdentityIcon
        isHighlight
        prefix={prefix}
        theme={thisTheme as 'substrate'}
        value={address}
        size={size - 2}
        {...props}
      />}
      size={size}
      className='DfIdentityIcon'
      {...props}
    />
  );
}

export default IdentityIcon
