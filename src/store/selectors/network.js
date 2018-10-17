import { createSelector } from "reselect";
import reselect from "../../utils/reselect";
import { fromJS } from "immutable";
import config from "../../configs";
import accounts from "./accounts";

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

const latestBlock = createSelector(network, state => state.get("latestBlock"));

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

const isNetworkCheckPending = createSelector(network, s =>
  s.get("isNetworkCheckPending")
);

const lastNetworkCheckAt = createSelector(network, s =>
  s.get("lastNetworkCheckAt")
);

const hasDefaultAccountChanged = createSelector(
  network,
  accounts.state,
  (s, accountsState) =>
    parseInt(s.getIn("lastNetworkCheckAt", "start")) <
    parseInt(accountsState.get("lastAccountSwitchAt"))
);

const lastCheckTotalTimeMs = createSelector(
  network,
  s =>
    parseInt(s.getIn("lastNetworkCheckAt", "end")) -
    parseInt(s.getIn("lastNetworkCheckAt", "start"))
);

const noProviderConnected = createSelector(network, s =>
  s.get("noProviderConnected")
);

const waitingForNetworkAccess = createSelector(network, s =>
  s.get("waitingForNetworkAccess")
);

const isNodeSyncing = createSelector(network, s =>
  s.getIn(["sync", "isPending"])
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
  lastNetworkCheckAt,
  hasDefaultAccountChanged,
  lastCheckTotalTimeMs,
  noProviderConnected,
  waitingForNetworkAccess,
  isNodeSyncing,
  latestBlock
};
