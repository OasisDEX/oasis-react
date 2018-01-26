import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import createDebounce from 'redux-debounced';
import { Map } from 'immutable';
import createHistory from 'history/createBrowserHistory';
import { routerReducer, routerMiddleware, push } from 'react-router-redux'
import logger from 'redux-logger'
import reducers from './reducers';


function initStore(defaultState = Map()) {
  const history = createHistory();
  const reactRouterMiddleware = routerMiddleware(history);

  let middleware = applyMiddleware(
    reactRouterMiddleware,
    createDebounce(),
    thunk,
    promiseMiddleware(),
    // logger
  );
  if (window.devToolsExtension) {
    middleware = compose(
      middleware,
      window.devToolsExtension && window.devToolsExtension(),
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
