// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IdentityProps as Props } from '@polkadot/react-identicon/types';

import React from 'react';
import styled from 'styled-components';
import BaseIdentityIcon from '@polkadot/react-identicon';

export function getIdentityTheme (): 'substrate' {
  return 'substrate';
}

function IdentityIcon ({ className, prefix, size, theme, value }: Props): React.ReactElement<Props> {
  const address = value?.toString() || '';
  const thisTheme = theme || getIdentityTheme();

  return (
    <span className={`ui--IdentityIcon-Outer ${className}`}>
      <BaseIdentityIcon
        isHighlight
        prefix={prefix}
        size={size}
        theme={thisTheme as 'substrate'}
        value={address}
        style={{ cursor: 'pointer' }}
      />
    </span>
  );
}

export default styled(IdentityIcon)`
  .ui--IdentityIcon {
    display: block;
  }
`
