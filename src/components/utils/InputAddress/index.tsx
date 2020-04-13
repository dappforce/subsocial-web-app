// Copyright 2017-2019 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { KeyringSectionOption, KeyringOption$Type } from '@polkadot/ui-keyring/options/types';
import { BareProps } from '@polkadot/react-components/types';
import { Option } from '@polkadot/react-components/InputAddress/types';

import React, { useState } from 'react';
import { useMyAccount } from '../MyAccountContext';
import InputAddress from '@polkadot/react-components/InputAddress';

interface Props extends BareProps {
  defaultValue?: Uint8Array | string | null;
  filter?: string[];
  help?: React.ReactNode;
  hideAddress?: boolean;
  isDisabled?: boolean;
  isError?: boolean;
  isInput?: boolean;
  isMultiple?: boolean;
  label?: React.ReactNode;
  labelExtra?: React.ReactNode;
  onChange?: (value: string | null) => void;
  onChangeMulti?: (value: string[]) => void;
  options?: KeyringSectionOption[];
  optionsAll?: Record<string, Option[]>;
  placeholder?: string;
  type?: KeyringOption$Type;
  value?: string | Uint8Array | string[] | null;
  withEllipsis?: boolean;
  withLabel?: boolean;
}

const DEFAULT_TYPE = 'all';
const MULTI_DEFAULT: string[] = [];

export const DfInputAddress = (props: Props) => {
  const { className, defaultValue, help, hideAddress = false, isDisabled = false, isError, isMultiple, label, labelExtra, options, optionsAll, placeholder, type = DEFAULT_TYPE, style, withEllipsis, withLabel, onChange, onChangeMulti } = props;
  const { state: { address }, set: setCurrentAccount } = useMyAccount();
  const [ value, setValue ] = useState(address !== undefined ? address : null);

  const DfOnChange = (value: string | null): void => {
    onChange && value && onChange(value);
    value && setValue(value);
    value && setCurrentAccount(value);
  }

  return <InputAddress
    className={className}
    type={type}
    defaultValue={defaultValue}
    help={help}
    isDisabled={isDisabled}
    isError={isError}
    isMultiple={isMultiple}
    label={label}
    labelExtra={labelExtra}
    hideAddress={hideAddress}
    onChange={DfOnChange}
    onChangeMulti={onChangeMulti}
    options={options}
    placeholder={placeholder}
    style={style}
    value={
      isMultiple && !value
        ? MULTI_DEFAULT
        : value
    }
    optionsAll={optionsAll}
    withEllipsis={withEllipsis}
    withLabel={withLabel}
  />
}

export default DfInputAddress;
