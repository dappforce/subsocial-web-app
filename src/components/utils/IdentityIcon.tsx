// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IdentityProps as Props } from '@polkadot/react-identicon/types';

import React, { useState } from 'react';
import styled from 'styled-components';
import BaseIdentityIcon from '@polkadot/react-identicon';
import ViewProfileLink from '../profiles/ViewProfileLink';

export function getIdentityTheme (): 'substrate' {
  return 'substrate';
}

function IdentityIcon ({ className, prefix, size, theme, value }: Props): React.ReactElement<Props> {
  const [ address ] = useState(value?.toString() || '');
  const thisTheme = theme || getIdentityTheme();

  return (
    <span className={`ui--IdentityIcon-Outer ${className}`}>
      <ViewProfileLink
        account={{ address }}
        title={<BaseIdentityIcon
          isHighlight
          prefix={prefix}
          size={size}
          theme={thisTheme as 'substrate'}
          value={address}
          style={{ cursor: 'pointer', marginRight: '.5rem' }}
        />}
      />
    </span>
  );
}

export default React.memo(styled(IdentityIcon)`
  .ui--IdentityIcon {
    display: block;
  }
`);
