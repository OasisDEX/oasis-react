import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import './index.css';
import OasisAppWrapper from './containers/OasisApp';

import * as web3 from './bootstrap/web3';
import * as Network from './bootstrap/network';
import configureStore from './store';
import platformReducer from './store/reducers/platform';
import networkReducer from './store/reducers/network';
import accountsReducer from './store/reducers/accounts';
import { HAS_ACCOUNTS } from './constants';
import { Session } from './utils/session';
import accounts from './store/selectors/accounts';
import period from './utils/period';
import conversion from './utils/conversion';
import { errorHandler } from './utils/errorHandlers';
import sak from './utils/sak';

const { store, history } = configureStore();

sak(store);

export const HEALTHCHECK_INTERVAL_MS = 2000;

const healthCheck = (dispatch, getState, isInitialHealthcheck = false) => {
  if (isInitialHealthcheck) {
    dispatch(networkReducer.actions.connecting());
  }

  Promise.all([Network.checkConnectivity()])
    .then(async (providerType) => {
      const connectedNetworkId = await dispatch(networkReducer.actions.getConnectedNetworkId());
      dispatch(networkReducer.actions.connected());
      if(isInitialHealthcheck) {
        /**
         * We only do this once, since later we subscribe to 'latest' filter
         * to get notified on new block resolved
         */
        dispatch(networkReducer.actions.getLatestBlockNumber());
      }
      if (providerType && connectedNetworkId.value) {
        const previousDefaultAccount = accounts.defaultAccount(getState());
        if (HAS_ACCOUNTS === await dispatch(accountsReducer.actions.checkAccountsEpic())) {
          try {
            /**
             *  Initialize session on first run of the healthcheck or when default address changes
             */
            const currentDefaultAccount = accounts.defaultAccount(getState());
            if (isInitialHealthcheck || previousDefaultAccount !== currentDefaultAccount) {
              Session.init(dispatch, getState);
            }
          } catch (e) {
            console.error('SESSION:INIT', e);
          }
          await dispatch(
            isInitialHealthcheck ?
              networkReducer.actions.checkNetworkInitialEpic() :
              networkReducer.actions.checkNetworkEpic()
          );
        }
        /**
         *  TODO @Georgi
         *  keep current state of the network connectivity in the store
         *  and only re-render when previous state was false
         */
      }
    })
    .catch((error) => {
      console.log("Error in healthCheck!", error);
      dispatch(networkReducer.actions.disconnected());
      errorHandler.handle(error);
    });
};

const bootstrap = async () => {
  const { dispatch, getState } = store;
  period.init(getState);
  conversion.init(getState);
  dispatch(platformReducer.actions.web3Initialized(web3.init()));
  await healthCheck(dispatch, getState, true);
  // TODO: extract this into a configuration and agree on the value.
  setInterval(await healthCheck.bind(null, dispatch, getState), HEALTHCHECK_INTERVAL_MS);
};

(async () => {
  await bootstrap();
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <OasisAppWrapper/>
      </ConnectedRouter>
    </Provider>
    , document.getElementById('root'));
})();