import network from "../store/selectors/network";
import {
  setLastNetworkCheckEndAt,
  setLastNetworkCheckStartAt
} from "../store/reducers/network/onNetworkCheckEndEpic";
import platformReducer from "../store/reducers/platform";
import networkReducer from "../store/reducers/network";
import * as Network from "./network";
import { checkIfOutOfSyncEpic } from "../store/reducers/network/checkIfOutOfSync";
import Raven from "raven-js";
import { registerSubscription } from "../utils/subscriptions/registerSubscription";
import {
  HAS_ACCOUNTS,
  SUBSCRIPTIONS_GROUP_GLOBAL_INITIAL,
  SUBSCRIPTIONS_LATEST_BLOCK
} from "../constants";
import { subscribeLatestBlockFilterEpic } from "../store/reducers/network/subscribeLatestBlockFilterEpic";
import accounts from "../store/selectors/accounts";
import accountsReducer from "../store/reducers/accounts";
import { Session } from "../utils/session";
import { CheckNetworkAction } from "../store/reducers/network/CheckNetworkAction";

export const healthCheck = async (
  dispatch,
  getState,
  isInitialHealthcheck = false
) => {
  if (network.isNetworkCheckPending(getState()) === true) {
    return;
  }
  dispatch(setLastNetworkCheckStartAt());
  if (isInitialHealthcheck) {
    dispatch(platformReducer.actions.setGlobalFormLockEnabled());
    dispatch(networkReducer.actions.connecting());
  }
  try {
    const providerType = await Network.checkConnectivity().catch();
    const connectedNetworkId = await dispatch(
      networkReducer.actions.getConnectedNetworkId()
    );
    if (isInitialHealthcheck) {
      await dispatch(checkIfOutOfSyncEpic());
      // console.log("connectedTo:", network.activeNetworkMeta(getState()).get('name'));
      Raven.setTagsContext({
        network: network.activeNetworkMeta(getState()).get("name")
      });
    }
    if (providerType && connectedNetworkId.value) {
      dispatch(networkReducer.actions.connected());
      if (isInitialHealthcheck) {
        /**
         * We only do this once, since later we subscribe to 'latest' filter
         * to get notified on new block resolved
         */
        dispatch(networkReducer.actions.getLatestBlockNumber());
        registerSubscription(
          SUBSCRIPTIONS_LATEST_BLOCK,
          () => dispatch(subscribeLatestBlockFilterEpic()),
          { dispatch, getState },
          SUBSCRIPTIONS_GROUP_GLOBAL_INITIAL
        );
      }
      const previousDefaultAccount = accounts.defaultAccount(getState());
      if (
        HAS_ACCOUNTS === await dispatch(accountsReducer.actions.checkAccountsEpic())
      ) {
        try {
          /**
           *  Initialize session on first run of the healthcheck or when default address changes
           */
          if (
            isInitialHealthcheck || previousDefaultAccount !== accounts.defaultAccount(getState())
          ) { Session.init(dispatch, getState); }
        } catch (e) {
          console.error("SESSION:INIT", e);
        }
        await dispatch(
          isInitialHealthcheck
            ? networkReducer.actions.checkNetworkInitialEpic()
            : networkReducer.actions.checkNetworkEpic(
                previousDefaultAccount !== accounts.defaultAccount(getState())
              )
        );
      } else {
        dispatch(CheckNetworkAction.fulfilled());
        dispatch(setLastNetworkCheckEndAt());
      }
    }
  } catch (error) {
    console.debug("Error in healthCheck!", error);
    dispatch(networkReducer.actions.disconnected());
    dispatch(CheckNetworkAction.fulfilled());
    dispatch(setLastNetworkCheckEndAt());
    // errorHandler.handle(error);
  }
};
