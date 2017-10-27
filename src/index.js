import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import './index.css';
import OasisAppWrapper from './containers/OasisApp';

import * as web3 from './bootstrap/web3';
import * as Network from './bootstrap/network';
// import * as Account from './bootstrap/account';
import {errorHandler} from './utils/errorHandlers';
import configureStore from './store';

const store = configureStore();

const healthCheck = () => {
  Promise.all([Network.checkConnectivity()])
    .then(() => {
      ReactDOM.render(
        <Provider store={store}>
          <OasisAppWrapper></OasisAppWrapper>
        </Provider>
        , document.getElementById('root'))
    })
    .catch((error) => {
      errorHandler.handle(error);
    });
};

const bootstrap = async () => {
  web3.init();
  await healthCheck();


  // TODO: extract this into a configuration and agree on the value.
  setInterval(await healthCheck, 5000);
};

(async () => {
  await bootstrap();
})();
