import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './index.css';
import OasisAppWrapper from './containers/OasisApp';

import * as web3 from './bootstrap/web3';
import * as Network from './bootstrap/network';
import configureStore from './store';
import { Session } from './utils/session';
import platformReducer from './store/reducers/platform';
import networkReducer from './store/reducers/network';
import accountsReducer from './store/reducers/accounts';
import { HAS_ACCOUNTS } from './constants';

const store = configureStore();

const healthCheck = (dispatch, isInitialHealhtcheck = false ) => {
  if(isInitialHealhtcheck) {
    dispatch(networkReducer.actions.connecting())
  }

  Promise.all([Network.checkConnectivity()])
    .then( async (providerType) => {
      const connectedNetworkId = await dispatch(networkReducer.actions.getConnectedNetworkId());
      dispatch(networkReducer.actions.connected());
      if(providerType && connectedNetworkId.value) {
        if(HAS_ACCOUNTS === await dispatch(accountsReducer.actions.checkAccountsEpic())) {
          await dispatch(
            networkReducer.actions.checkNetworkEpic(providerType.join(), isInitialHealhtcheck)
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
      dispatch(networkReducer.actions.disconnected());
      // errorHandler.handle(error);
    });
};

const bootstrap = async () => {
  const { dispatch, getState } = store;
  dispatch(platformReducer.actions.web3Initialized(web3.init()));
  await healthCheck(dispatch, true);
  Session.init(getState);
  // TODO: extract this into a configuration and agree on the value.
  setInterval(await healthCheck.bind(null, dispatch), 1000);
};

(async () => {
  await bootstrap();
  ReactDOM.render(
    <Provider store={store}>
      <OasisAppWrapper/>
    </Provider>
    , document.getElementById('root'));
})();
