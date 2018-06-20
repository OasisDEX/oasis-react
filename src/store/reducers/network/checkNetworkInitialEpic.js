import network from "../../selectors/network";
import balancesReducer from "../balances";
import contractsBootstrap from "../../../bootstrap/contracts";
import marketBootstrap from "../../../bootstrap/market";
import tokens from "../../selectors/tokens";
import platformReducer from "../platform";
import tokensReducer from "../tokens";
import accounts from "../../selectors/accounts";
import offersReducer from "../offers";
import { CheckNetworkAction } from "./CheckNetworkAction";
import { onNetworkCheckEndEpic } from "./onNetworkCheckEndEpic";
import platform from "../../selectors/platform";

export const checkNetworkInitialEpic = () => async (dispatch, getState) => {
  dispatch(CheckNetworkAction.pending());
  dispatch(platformReducer.actions.networkChanged());
  dispatch(platformReducer.actions.web3Reset());
  const currentNetworkName = network.activeNetworkName(getState());
  dispatch(offersReducer.actions.initOffersEpic());
  if (!tokens.activeTradingPair(getState())) {
    dispatch(
      tokensReducer.actions.setActiveTradingPairEpic(
        tokens.defaultTradingPair(getState()).toJS(),
        false
      )
    );
  }
  // Loading contracts and initializing market
  try {
    return await Promise.all([
      dispatch(
        platformReducer.actions.contractsLoaded(
          contractsBootstrap.init(currentNetworkName)
        )
      ),
      await dispatch(balancesReducer.actions.getDefaultAccountEthBalance()),
      await dispatch(
        balancesReducer.actions.subscribeAccountEthBalanceChangeEventEpic(
          accounts.defaultAccount(getState())
        )
      ),
      await dispatch(
        platformReducer.actions.marketInitialized(
          marketBootstrap.init(dispatch, currentNetworkName)
        )
      )
    ]).then(
      onNetworkCheckEndEpic(
        dispatch,
        getState,
        !platform.allInitialSubscriptionsRegistered(getState())
      )
    );
  } catch (e) {
    console.warn("Can't fetch network data!", e);
  }
};
