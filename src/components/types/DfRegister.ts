import { RegistryTypes } from '@polkadot/types/types';

import * as dfDefinations from '@subsocial/types/interfaces/definitions';
import { registry } from '@polkadot/react-api';

export const allDefinitions = {
  ...dfDefinations
};

export const types: RegistryTypes = Object.values(allDefinitions).map(({ types }) => types).reduce((all, types) => Object.assign(all, types), {});

export const registerSubsocialTypes = (): void => {
  try {
    registry.register(types);
  } catch (err) {
    console.error('Failed to register custom types of blogs module', err);
  }
};

export default registerSubsocialTypes;
