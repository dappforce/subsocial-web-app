import { types } from '@subsocial/types/substrate/preparedTypes'
import { registry } from '@polkadot/react-api';

export const registerSubsocialTypes = (): void => {
  try {
    registry.register(types);
  } catch (err) {
    console.error('Failed to register custom types of blogs module', err);
  }
};

export default registerSubsocialTypes;
