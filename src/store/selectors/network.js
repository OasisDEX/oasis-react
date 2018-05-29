import { createSelector } from "reselect";
import reselect from "../../utils/reselect";
import { fromJS } from "immutable";
import config from "../../configs";

const network = state => state.get("network");

const activeNetworkId = createSelector(network, state =>
  state.get("activeNetworkId")
);

const activeNetworkMeta = createSelector(activeNetworkId, id => {
  if (id) {
    return fromJS(config.networks).find(n => n.get("id") == id);
  } else {
    return null;
  }
});

const activeNetworkName = createSelector(
  activeNetworkMeta,
  network => (network ? network.get("name") : "-")
);

const activeNetworkProviderType = createSelector(
  activeNetworkMeta,
  network => (network ? network.get("providerType") : undefined)
);

const status = createSelector(network, state => state.get("status"));

const latestBlockNumber = createSelector(network, state =>
  state.get("latestBlockNumber")
);

const latestEthereumPrice = createSelector(network, s =>
  s.get("latestEthereumPrice")
);

const tokenAddresses = createSelector(activeNetworkName, activeNetworkName =>
  fromJS(config.tokens[activeNetworkName])
);

const getTokenAddress = createSelector(
  tokenAddresses,
  reselect.getProps,
  (tokens, tokenName) => tokens.get(tokenName)
);

const isNetworkCheckPending = createSelector(
  network,
  s => s.get('isNetworkCheckPending')
);

const lastNetworkCheckAt = createSelector(
  network,
  s => s.get('lastNetworkCheckAt')
);


export default {
  state: network,
  status,
  activeNetworkId,
  activeNetworkName,
  activeNetworkProviderType,
  activeNetworkMeta,
  latestBlockNumber,
  latestEthereumPrice,
  getTokenAddress,
  tokenAddresses,
  isNetworkCheckPending,
  lastNetworkCheckAt
};
