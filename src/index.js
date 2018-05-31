/* eslint-disable no-empty */
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "react-router-redux";

import "./index.css";
import OasisAppWrapper from "./containers/OasisApp";


import * as web3 from "./bootstrap/web3";
import * as Network from "./bootstrap/network";
import configureStore from "./store";
import platformReducer from "./store/reducers/platform";
import networkReducer from "./store/reducers/network";
import accountsReducer from "./store/reducers/accounts";
import { HAS_ACCOUNTS } from "./constants";
import { Session } from "./utils/session";
import accounts from "./store/selectors/accounts";
import period from "./utils/period";
import conversion from "./utils/conversion";
import { errorHandler } from "./utils/errorHandlers";
import sak from "./utils/sak";
import Raven from "raven-js";
import version from "./version";
import network from "./store/selectors/network";
import { CheckNetworkAction } from "./store/reducers/network/CheckNetworkAction";
import { web3p } from "./bootstrap/web3";
import {
  setLastNetworkCheckEndAt,
  setLastNetworkCheckStartAt
} from "./store/reducers/network/onNetworkCheckEndEpic";

//sentry.io configuration
if (version.env === "production") {
  console.log("sentry.io configured!");
  Raven.config("https://8ca5cb1ed0e04a57bb36c7720e235754@sentry.io/1208618", {
    release: version.hash,
    environment: version.env
  }).install();
}

const { store, history } = configureStore();

sak(store);

export const HEALTHCHECK_INTERVAL_MS = 2000;
const PENDING_INITIAL_NETWORK_CHECK = "PENDING_INITIAL_NETWORK_CHECK";

const healthCheck = (dispatch, getState, isInitialHealthcheck = false) => {
  if (network.isNetworkCheckPending(getState()) === true) {
    return;
  }
  dispatch(setLastNetworkCheckStartAt());
  if (isInitialHealthcheck) {
    dispatch(networkReducer.actions.connecting());
  } else {
  }
  Promise.all([Network.checkConnectivity()])
    .then(async providerType => {
      const connectedNetworkId = await dispatch(
        networkReducer.actions.getConnectedNetworkId()
      );

      if (isInitialHealthcheck) {
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
        }
        const previousDefaultAccount = accounts.defaultAccount(getState());
        if (
          HAS_ACCOUNTS ===
          (await dispatch(accountsReducer.actions.checkAccountsEpic()))
        ) {
          try {
            /**
             *  Initialize session on first run of the healthcheck or when default address changes
             */
            if (
              isInitialHealthcheck ||
              previousDefaultAccount !== accounts.defaultAccount(getState())
            ) {
              Session.init(dispatch, getState);
            }
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
    })
    .catch(error => {
      console.log("Error in healthCheck!", error);
      dispatch(networkReducer.actions.disconnected());
      dispatch(CheckNetworkAction.fulfilled());
      dispatch(setLastNetworkCheckEndAt());
      errorHandler.handle(error);
    });
};

const bootstrap = async () => {
  const { dispatch, getState } = store;
  period.init(getState);
  conversion.init(getState);
  await dispatch(platformReducer.actions.web3Initialized(web3.init()));
  let networkCheckIntervalId = null;
  let checkingConnectivity = null;
  const checkIfInitiallyLocked = setInterval(() => {
    if (
      !checkingConnectivity &&
      networkCheckIntervalId !== PENDING_INITIAL_NETWORK_CHECK
    ) {
      checkingConnectivity = true;
      Network.checkConnectivity()
        .then(async () => {
          dispatch(networkReducer.actions.setNoProviderConnected(false));
          if (web3p.eth.accounts.length) {
            networkCheckIntervalId = PENDING_INITIAL_NETWORK_CHECK;
            clearInterval(checkIfInitiallyLocked);
            await healthCheck(dispatch, getState, true);
            networkCheckIntervalId = setInterval(
              await healthCheck.bind(null, dispatch, getState),
              HEALTHCHECK_INTERVAL_MS
            );
          } else {
            dispatch(platformReducer.actions.metamaskLocked());
          }
          checkingConnectivity = false;
        })
        .catch(error => {
          console.log("Error in healthCheck!", error);
          dispatch(networkReducer.actions.setNoProviderConnected(true));
          dispatch(networkReducer.actions.disconnected());
          errorHandler.handle(error);
          setTimeout(() => location.reload(true), 5000);
        });
    }
  }, 1000);
};

Raven.context(function() {
  (async () => {
    try {
      await bootstrap();
    } catch (e) {
      console.log(e)
    }
    ReactDOM.render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <OasisAppWrapper />
        </ConnectedRouter>

      </Provider>,
      document.getElementById("root")
    );
  })();
});
