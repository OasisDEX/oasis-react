/* eslint-disable no-empty */
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "react-router-redux";
import "./index.css";
import "./styles/style.scss";
import OasisAppWrapper from "./containers/OasisApp";

import * as web3 from "./bootstrap/web3";
import * as Network from "./bootstrap/network";
import { HEALTHCHECK_INTERVAL_MS } from "./bootstrap/network";
import configureStore from "./store";
import platformReducer from "./store/reducers/platform";
import networkReducer from "./store/reducers/network";
import period from "./utils/period";
import conversion from "./utils/conversion";
import sak from "./utils/sak";
import Raven from "raven-js";
import version from "./version";
import { healthCheck } from "./bootstrap/healthcheck";
import promisify from './utils/promisify';
import { web3p } from './bootstrap/web3';

//sentry.io configuration
if (version.env === "production" && version.branch !== "master") {
  console.log("sentry.io configured!");
  Raven.config("https://8ca5cb1ed0e04a57bb36c7720e235754@sentry.io/1208618", {
    release: version.hash,
    environment: version.env
  }).install();
}

const { store, history } = configureStore();
const PENDING_INITIAL_NETWORK_CHECK = "PENDING_INITIAL_NETWORK_CHECK";

let isCheckingConnectivityPromise = null;
let networkCheckIntervalId = null;
let checkIfInitiallyLockedIntervalId = null;

sak(store);

const bootstrap = async () => {
  const { dispatch, getState } = store;
  period.init(getState);
  conversion.init(getState);

  try {
    await dispatch(
      platformReducer.actions.web3Initialized(
        await web3.init(dispatch)
      )
    );
  } catch (e) {
    await dispatch(
      networkReducer.actions.setNoProviderConnected(true)
    );
    throw e;
  }

  const onSuccessfulCheck = async ({ dispatch, getState }) => {
    const accountsList = await promisify(web3p.eth.getAccounts).call();
    dispatch(
      networkReducer.actions.setNoProviderConnected(false)
    );
    if (accountsList && accountsList.length) {
      networkCheckIntervalId = PENDING_INITIAL_NETWORK_CHECK;
      clearInterval(checkIfInitiallyLockedIntervalId);
      await healthCheck(dispatch, getState, true);
      networkCheckIntervalId = setInterval(
        await healthCheck.bind(null, dispatch, getState),
        HEALTHCHECK_INTERVAL_MS
      );
    } else {
      dispatch(platformReducer.actions.accountLocked());
    }
    isCheckingConnectivityPromise = null;
  };

  checkIfInitiallyLockedIntervalId = setInterval(async (dispatch, getState) => {
    try {
      if (
        isCheckingConnectivityPromise === null &&
        networkCheckIntervalId !== PENDING_INITIAL_NETWORK_CHECK
      ) {
        isCheckingConnectivityPromise = true;
        const nodeType = await Network.checkConnectivity();
        dispatch(
          platformReducer.actions.setActiveNodeType(nodeType)
        );
        await onSuccessfulCheck({ dispatch, getState });
      }
    } catch (error) {
      console.debug("Error in healthCheck!", error.toString());
      dispatch(networkReducer.actions.setNoProviderConnected(true));
      dispatch(networkReducer.actions.disconnected());
      // setTimeout(() => location.reload(true), 5000);
    }
  }, 1000, dispatch, getState);
};

Raven.context(function() {
  (async () => {
    try {
      await bootstrap();
    } catch (e) {
      console.log(e);
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
