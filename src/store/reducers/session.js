import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import web3 from '../../bootstrap/web3';

import { fulfilled, pending, rejected } from '../../utils/store';

const TRADES_LIMIT = 0;
const OFFER_LIMIT = 0;

const initialState = Immutable.fromJS({
  limitsLoaded: false,
  lastTradesLimit: TRADES_LIMIT,
  orderBookLimit: OFFER_LIMIT,
  network: false,
  loading: false,
  loadingBuyOrders: true,
  loadingSellOrders: true,
  loadingProgress: 0,
  loadingCounter: 0,
  outOfSync: false,
  syncing: false,
  isConnected: false,
  latestBlock: 0,
  balanceLoaded: false,
  allowanceLoaded: false,
  loadingTradeHistory: true,
  loadingIndividualTradeHistory: false, // this will be loading only if the user filter by closed status of orders
  AVGBlocksPerDay: null,
  watchedEvents: false,
//   if !Session.get'volumeSelector' {
//     'volumeSelector': 'quote':
//   }
});

const INIT = 'SESSION/INIT';
const SET_VALUE = 'SESSION/SET_VALUE';
const RESET_TO_DEFAULT = 'SESSION/RESET_TO_DEFAULT';

const Init = createAction(
  INIT,
);

const SetValue = createAction(
  SET_VALUE,
  (key, value) => ({ key, value }),
);

const ResetToDefault = createAction(
  RESET_TO_DEFAULT,
  (key) => initialState.get(key) || null,
);

const actions = {
  Init,
  SetValue,
  ResetToDefault,
};

const reducer = handleActions(
  {},
  initialState);

export default {
  actions,
  reducer,
};
