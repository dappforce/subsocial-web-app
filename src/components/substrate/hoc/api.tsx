// Copyright 2017-2020 @polkadot/react-api authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useRef } from 'react';
import { DefaultProps, ApiProps } from './types';
import useSubstrate from '../useSubstrate';

export default function withApi <P extends ApiProps> (
  Inner: React.ComponentType<P>,
  defaultProps: DefaultProps = {}
): React.ComponentType<any> {
  return (props: any) => {
    const component = useRef()
    const { api } = useSubstrate()

    return !api ? null : <Inner
      {...defaultProps as any}
      {...props}
      api={api}
      ref={component}
    />
  }
}
