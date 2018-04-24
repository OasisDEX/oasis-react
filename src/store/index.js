import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { deferredThunk } from './deferredThunk';
import promiseMiddleware from 'redux-promise-middleware';
import createDebounce from 'redux-debounced';
import { Map } from 'immutable';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux'
import reducers from './reducers';


function initStore(defaultState = Map()) {
  const history = createHistory();
  const reactRouterMiddleware = routerMiddleware(history);

  let middleware = applyMiddleware(
    reactRouterMiddleware,
    createDebounce(),
    deferredThunk,
    thunk,
    promiseMiddleware(),
  );
  if (window.devToolsExtension) {
    middleware = compose(
      middleware,
      window.devToolsExtension && window.devToolsExtension({
        actionsBlacklist: [
          "TIMERS/UPDATE_TIMESTAMP",
          "NETWORK_GET_LATEST_BLOCK_NUMBER_PENDING",
          "NETWORK_GET_LATEST_BLOCK_NUMBER_FULFILLED",
          "NETWORK/GET_CONNECTED_NETWORK_ID_PENDING",
          "NETWORK/GET_CONNECTED_NETWORK_ID_FULFILLED",
          "NETWORK/CHECK_NETWORK_PENDING",
          "NETWORK/CHECK_NETWORK_FULFILLED"
        ]
      }),
    );
  }

  const store = createStore(
    reducers, defaultState, middleware
  );

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const nextReducer = require('./reducers');  // eslint-disable-line global-require
      store.replaceReducer(nextReducer);
    });
  }

  return { store, history };
}

export default initStore;
