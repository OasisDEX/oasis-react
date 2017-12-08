import { createSelector } from 'reselect';

const state = s => s.get('network');

const status = createSelector(
  state,
    s => s.get('status')
);

const getActiveNetworkName = createSelector(
  state,
  s => s.get('activeNetworkName') || '-'
);

export default {
  state,
  status,
  getActiveNetworkName,
};