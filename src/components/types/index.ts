import { types } from '@subsocial/types/substrate/preparedTypes'
import { registry } from '@polkadot/react-api';
import { newLogger } from '@subsocial/utils';
const log = newLogger('types')
export const registerSubsocialTypes = (): void => {
  try {
    registry.register(types);
  } catch (err) {
    log.error(`Failed to register custom types of blogs module: ${err}`);
  }
};

export default registerSubsocialTypes;
