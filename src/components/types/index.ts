import { types } from '@subsocial/types/substrate/preparedTypes'
import { registry } from '@subsocial/types/substrate/registry';
import { newLogger } from '@subsocial/utils';

const log = newLogger('SubsocialTypes')

export const registerSubsocialTypes = (): void => {
  try {
    registry.register(types);
    log.info('Succesfully registered custom types of Subsocial modules')
  } catch (err) {
    log.error('Failed to register custom types of Subsocial modules:', err);
  }
};

export default registerSubsocialTypes;
