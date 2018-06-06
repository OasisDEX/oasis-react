import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { push } from 'react-router-redux';

import { Session } from '../../utils/session';
import { WEEK } from '../../utils/period';
import { ETH_UNIT_WEI } from '../../constants';
import web3 from '../../bootstrap/web3';

const initialState = fromJS(
  {
    // sids: [], // currently running setIntevals cancel ids
    errors: [],
    web3Initialized: null,
    contractsLoaded: false,
    ordersLoadStatus: false,
    tradeHistoryLoadStatus: false,
    marketVolumeLoadStatus: false,
    metamaskLocked: false,
    lastNetworkSwitchAt: null,
    defaultTradingPair: {baseToken: 'MKR', quoteToken: 'W-ETH'},
    defaultPeriod: WEEK,
    activePeriod: WEEK,
    defaultUnit: ETH_UNIT_WEI,
    globalFormLock: true,
    isAppLoading: true
  });


const Init = createAction(
  'PLATFORM/INIT',
  async () => null,
);

const platformInitEpic = () => async (dispatch) => {
  dispatch(Init());
};

const setPlatformErrors = createAction('PLATFORM/SET_PLATFORM_ERRORS');

const resetPlatformErrors = createAction('PLATFORM/RESET_PLATFORM_ERRORS');

const web3Initialized = createAction('PLATFORM/WEB3_INITIALIZED', p => p);

const web3Reset = createAction('PLATFORM/WEB3_RESET', () => web3.reset());

const web3ResetKeepSync = createAction('PLATFORM/WEB3_RESET_KEEP_SYNC',
  () => web3.reset(true));

const contractsLoaded = createAction('PLATFORM/CONTRACTS_LOADED', p => p);

const contractsReloaded = createAction('PLATFORM/CONTRACTS_RELOADED');

const marketInitialized = createAction('PLATFORM/MARKET_INITIALIZED');

const marketReinitialized = createAction('PLATFORM/MARKET_REINITIALIZED');

const metamaskLocked = createAction('PLATFORM/METAMASK_LOCKED');

const metamaskUnlocked = createAction('PLATFORM/METAMASK_UNLOCKED');

const networkChanged = createAction('PLATFORM/ACTIVE_NETWORK_CHANGED');

const changeRoute = createAction('PLATFORM/CHANGE_ROUTE', route => route);

const changeRouteEpic = (route) => (dispatch) => {
  dispatch(changeRoute(route));
  dispatch(push(route));
};

const dismissMessage = (
  msgType,
  dismissMessageAction = createAction('PLATFORM/DISMISS_MESSAGE', msgType => msgType)
) => (dispatch) => {
  Session.dismissMessage(dispatch, msgType);
  dispatch(dismissMessageAction(msgType));
};


const setGlobalFormLockEnabled = createAction('PLATFORM/SET_GLOBAL_FORM_LOCK_ENABLED');
const setGlobalFormLockDisabled = createAction('PLATFORM/SET_GLOBAL_FORM_LOCK_DISABLED');
const setIsAppLoadingLockEnabled = createAction('PLATFORM/IS_APP_LOADING_ENABLED');
const setIsAppLoadingDisabled = createAction('PLATFORM/SET_IS_APP_LOADING_DISABLED');
const actions = {
  platformInitEpic,
  web3Initialized,
  web3Reset,
  web3ResetKeepSync,
  contractsLoaded,
  contractsReloaded,
  marketInitialized,
  marketReinitialized,
  setPlatformErrors,
  resetPlatformErrors,
  metamaskLocked,
  metamaskUnlocked,
  networkChanged,
  dismissMessage,
  changeRouteEpic,
  setGlobalFormLockEnabled,
  setGlobalFormLockDisabled,
  setIsAppLoadingDisabled,
  setIsAppLoadingLockEnabled
};

const reducer = handleActions({
  [contractsLoaded]: (state) => state.set('contractsLoaded', true),
  [marketInitialized]: (state) => state.set('marketInitialized', true),
  [web3Initialized]: (state) => state.set('web3Initialized', true),
  [metamaskLocked]: (state) => state.set('metamaskLocked', true),
  [metamaskUnlocked]: (state) => state.set('metamaskLocked', false),
  [networkChanged]: (state) => state.set('lastNetworkSwitchAt', Date.now()),
  [setGlobalFormLockEnabled]: state => state.set('globalFormLock', true),
  [setGlobalFormLockDisabled]: state => state.set('globalFormLock', false),
  [setIsAppLoadingLockEnabled]: state => state.set('isAppLoading', true),
  [setIsAppLoadingDisabled]: state => state.set('isAppLoading', false)
}, initialState);

export default {
  actions,
  reducer,
};