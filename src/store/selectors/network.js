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

const latestBlockNumber = createSelector(
  state,
  (s) =>  s.get('latestBlockNumber')
);

const getActiveNetworkMeta = createSelector(
  state,
  getActiveNetworkName,
  (s, activeNetworkName) =>
    activeNetworkName ? s.get('networks').find(n => n.get('name') === activeNetworkName): null
);


export default {
  state,
  status,
  getActiveNetworkName,
  getActiveNetworkMeta,
  latestBlockNumber,
};