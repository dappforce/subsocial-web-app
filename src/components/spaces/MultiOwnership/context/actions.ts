import {
  SET_STATE,
  SET_OWNERS_TO_ADD,
  REMOVE_OWNERS_FROM_TO_ADD,
  SELECT_OWNERS_FROM_TO_ADD,
  SELECT_OWNERS_FROM_MAIN
} from './types';

export const setState = (state) => ({
  type: SET_STATE,
  payload: state
});

export const setOwnersToAdd = (newOwner) => ({
  type: SET_OWNERS_TO_ADD,
  payload: newOwner
})

export const removeOwnersFromToAdd = (ownersToRemoveFromToAdd) => ({
  type: REMOVE_OWNERS_FROM_TO_ADD,
  payload: ownersToRemoveFromToAdd
})

export const selectOwnersFromToAdd = (selectedOwnersFromToAdd) => ({
  type: SELECT_OWNERS_FROM_TO_ADD,
  payload: selectedOwnersFromToAdd
});

export const selectOwnersFromMain = (selectedOwnersFromToAdd) => ({
  type: SELECT_OWNERS_FROM_MAIN,
  payload: selectedOwnersFromToAdd
});
