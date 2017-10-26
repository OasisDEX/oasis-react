import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './index.css';
import OasisAppWrapper from './containers/OasisApp';
import registerServiceWorker from './registerServiceWorker';

import configureStore from './store';
const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <OasisAppWrapper />
  </Provider>
  , document.getElementById('root'));
registerServiceWorker();
