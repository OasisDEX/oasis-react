import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './index.css';
import OasisAppWrapper from './containers/OasisApp';

import * as web3 from './bootstrap/web3';
import * as Network from './bootstrap/network';
// import * as Account from './bootstrap/account';
import { errorHandler } from './utils/errorHandlers';
import configureStore from './store';
import { Session } from './utils/session';
import platformReducer from './store/reducers/platform';
import networkReducer from './store/reducers/network';
import accountsReducer from './store/reducers/accounts';

const store = configureStore();

const healthCheck = (dispatch) => {
  Promise.all([Network.checkConnectivity()])
    .then( async (providerType) => {
      const connectedNetworkId = await dispatch(networkReducer.actions.getConnectedNetworkId());
      if(providerType && connectedNetworkId.value) {
        const CheckNetworkEpicAction = await dispatch(networkReducer.actions.checkNetworkEpic(providerType.join()));
        await dispatch(accountsReducer.actions.checkAccountsEpic());
        /**
         *  TODO @Georgi
         *  keep current state of the network connectivity in the store
         *  and only re-render when previous state was false
         */
        ReactDOM.render(
          <Provider store={store}>
            <OasisAppWrapper></OasisAppWrapper>
          </Provider>
          , document.getElementById('root'));
      }
    })
    .catch((error) => {
      errorHandler.handle(error);
    });
};

const bootstrap = async () => {
  const { dispatch, getState } = store;
  dispatch(platformReducer.actions.web3Initialized(web3.init()));
  await healthCheck(dispatch);
  Session.init(getState);

  // TODO: extract this into a configuration and agree on the value.
  setInterval(await healthCheck.bind(null, dispatch), 3000);
};

(async () => {
  await bootstrap();
})();
