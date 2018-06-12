import network from "../../selectors/network";
import balancesReducer from "../balances";
import { getTokenContractsList } from "../../../bootstrap/contracts";
import { CheckNetworkAction } from "./CheckNetworkAction";
import contractsBootstrap from "../../../bootstrap/contracts";
import marketBootstrap from "../../../bootstrap/market";
import platformReducer from "../platform";
import accounts from "../../selectors/accounts";
import { createAction } from "redux-actions";
import { web3p } from "../../../bootstrap/web3";
import { onNetworkCheckEndEpic } from "./onNetworkCheckEndEpic";

export const getConnectedNetworkId = createAction(
  "NETWORK/GET_CONNECTED_NETWORK_ID",
  () => web3p.version.getNetwork()
);

export const checkNetworkEpic = hasAccountChanged => async (
  dispatch,
  getState
) => {
  if (network.isNetworkCheckPending(getState()) === true) {
    return;
  }

  dispatch(CheckNetworkAction.pending());
  const previousNetworkId = network.activeNetworkId(getState());
  const currentNetworkIdAction = await dispatch(getConnectedNetworkId());
  const currentNetworkName = network.activeNetworkName(getState());
  if (previousNetworkId !== currentNetworkIdAction.value) {
    /**
     * When network has changed we:
     * - call web3.reset()
     * - reload contracts with new network adressess.
     * - initialize market on the new network.
     * - load token allowances.
     */
    return await Promise.all([
      dispatch(platformReducer.actions.web3Reset()),
      dispatch(
        platformReducer.actions.contractsLoaded(
          contractsBootstrap.init(currentNetworkName)
        )
      ),
      await dispatch(balancesReducer.actions.getDefaultAccountEthBalance()),
      await dispatch(
        platformReducer.actions.marketInitialized(
          marketBootstrap.init(dispatch, currentNetworkName)
        )
      ),
      dispatch(
        balancesReducer.actions.getAllTradedTokensBalances(
          getTokenContractsList(),
          accounts.defaultAccount(getState())
        )
      )
    ]).then(onNetworkCheckEndEpic(dispatch, getState, true));
  } else {
    onNetworkCheckEndEpic(dispatch, getState, false, hasAccountChanged);
  }
};
