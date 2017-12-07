import { createSelector } from 'reselect';

const state = s => s.get('network');

const getActiveNetworkName = createSelector(
  state,
  (s) => {
    return s.get('activeNetworkName');
  },
);

export default {
  state,
  getActiveNetworkName,
};