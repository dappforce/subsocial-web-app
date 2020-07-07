// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IdentityProps as Props } from '@polkadot/react-identicon/types';

import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import BaseIdentityIcon from '@polkadot/react-identicon';
import { ValidatorsContext } from '@subsocial/react-query';

export function getIdentityTheme (): 'substrate' {
  return 'substrate';
}

function IdentityIcon ({ className, prefix, size, theme, value }: Props): React.ReactElement<Props> {
  const validators = useContext(ValidatorsContext);
  const [ isValidator, setIsValidator ] = useState(false);
  const [ address ] = useState(value?.toString());
  const thisTheme = theme || getIdentityTheme();

  useEffect((): void => {
    value && setIsValidator(
      validators.includes(value.toString())
    );
  }, [ value, validators ]);

  return (
    <span className={`ui--IdentityIcon-Outer ${className}`}>
      <BaseIdentityIcon
        isHighlight={isValidator}
        prefix={prefix}
        size={size}
        theme={thisTheme as 'substrate'}
        value={address}
      />
    </span>
  );
}

export default React.memo(styled(IdentityIcon)`
  .ui--IdentityIcon {
    display: block;
  }
`);
