import { createSelector } from 'reselect';

const network = state => state.get('network');

const status = createSelector(
  network,
  state => state.get('status')
);

const getActiveNetworkName = createSelector(
  network,
  state => state.get('activeNetworkName') || '-'
);

const latestBlockNumber = createSelector(
  network,
  state =>  state.get('latestBlockNumber')
);

const getActiveNetworkMeta = createSelector(
  network,
  getActiveNetworkName,
  (state, activeNetworkName) =>
    activeNetworkName ? state.get('networks').find(n => n.get('name') === activeNetworkName): null
);

const latestEthereumPrice = createSelector(
  network,
  s => s.get('latestEthereumPrice')
)

export default {
  state: network,
  status,
  getActiveNetworkName,
  getActiveNetworkMeta,
  latestBlockNumber,
  latestEthereumPrice
};