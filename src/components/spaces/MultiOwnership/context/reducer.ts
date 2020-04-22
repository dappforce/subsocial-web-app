import {
  SET_STATE,
  SET_OWNERS_TO_ADD,
  REMOVE_OWNERS_FROM_TO_ADD,
  SELECT_OWNERS_FROM_TO_ADD,
  SELECT_OWNERS_FROM_MAIN
} from './types';

export const initialState = {
  confirmationsRequired: 1,
  owners: [],
  ownersToAdd: [],
  selectedOwnersFromMain: [],
  selectedOwnersFromToAdd: [],
  changes: []
}

const generateNewOwner = ({ ownersToAdd }, address) => ({
  key: (ownersToAdd.length + 1).toString(),
  account: {
    address,
    img: 'https://svgshare.com/i/KDr.svg'
  }
});

const filterOwnersList = (owners, payload) =>
  owners.filter(owner =>
    !payload.filter(ownerToRemove => owner.key === ownerToRemove.key).length
  );

export const reducer = (state, action) => {
  switch (action.type) {
    case SET_STATE:
      return { ...state, ...action.payload };
    case SET_OWNERS_TO_ADD:
      return { ...state, ownersToAdd: [ ...state.ownersToAdd, generateNewOwner(state, action.payload) ] }
    case REMOVE_OWNERS_FROM_TO_ADD:
      return { ...state, ownersToAdd: filterOwnersList(state.ownersToAdd, action.payload) }
    case SELECT_OWNERS_FROM_TO_ADD:
      return { ...state, selectedOwnersFromToAdd: action.payload }
    case SELECT_OWNERS_FROM_MAIN:
      return { ...state, selectedOwnersFromMain: action.payload }
    default:
      return state;
  }
};
