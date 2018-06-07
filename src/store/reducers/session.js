import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import { MSGTYPE_INFO, MSGTYPE_WARNING } from '../../components/OasisMessage';

const initialState = Immutable.fromJS({
  initialized: false,
  session: {
    // limitsLoaded: false,
    // lastTradesLimit: TRADES_LIMIT,
    // orderBookLimit: OFFER_LIMIT,
    // network: false,
    // loading: false,
    // loadingBuyOrders: true,
    // loadingSellOrders: true,
    // loadingProgress: 0,
    // loadingCounter: 0,
    // outOfSync: false,
    // syncing: false,
    // isConnected: false,
    // latestBlock: 0,
    // balanceLoaded: false,
    // allowanceLoaded: false,
    // loadingTradeHistory: true,
    // loadingIndividualTradeHistory: false, // this will be loading only if the user filter by closed status of orders
    // AVGBlocksPerDay: null,
    // watchedEvents: false,
  },
  persist: {
    messages: {
      [MSGTYPE_WARNING]: {},
      [MSGTYPE_INFO]: {
        dismissed: false
      }
    }
  }
});

const INIT = 'SESSION/INIT';
const SET_VALUE = 'SESSION/SET_VALUE';
const LOAD_SAVED_SESSION_DATA = 'SESSION/LOAD_SAVED_SESSION_DATA';
const LOAD_SAVED_PERSISTENT_DATA = 'SESSION/LOAD_SAVED_PERSISTENT_DATA';

const DISMISS_MESSAGE = 'SESSION/DISMISS_MESSAGE';

const RESET_SESSION = 'SESSION/RESET_SESSION';
const RESET_TO_DEFAULT = 'SESSION/RESET_TO_DEFAULT';

const init = createAction(
  INIT,
  initData => initData
);

const SetValue = createAction(
  SET_VALUE,
  (key, value) => ({ key, value }),
);

const resetSession = createAction(
  RESET_SESSION,
  (key) => initialState.get(key) || null,
);

const resetToDefault = createAction(
  RESET_TO_DEFAULT,
  (key) => initialState.get(key) || null,
);

const dismissMessage = createAction(
  DISMISS_MESSAGE,
  msgType => msgType
);

const loadSavedSessionData = createAction(
  LOAD_SAVED_SESSION_DATA,
  msgType => msgType
);

const loadSavedPersistentData = createAction(
  LOAD_SAVED_PERSISTENT_DATA,
  msgType => msgType
);

const actions = {
  init,
  SetValue,
  dismissMessage,
  loadSavedSessionData,
  loadSavedPersistentData,
  resetSession,
  resetToDefault,
};

const reducer = handleActions(
  {
    resetSession: (state) => state.set(initialState),
    [init]: (state) => state.setIn(['initialized'], true),
    [loadSavedPersistentData]: (state, { payload }) => state.setIn(['persist'],payload),
    [loadSavedSessionData]: (state, { payload }) => state.setIn(['session'], payload),
    [dismissMessage]: (state, { payload }) => state.setIn(['persist', 'messages', payload, 'dismissed'], true),
  },
  initialState);

export default {
  actions,
  reducer,
};
