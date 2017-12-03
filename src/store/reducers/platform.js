import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import networkReducer from './network';
import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS(
  {
    sids: [], // currently running setIntevals cancel ids
    errors: [],
    web3Initialized: null,
    contractsLoaded: false,
    metamaskLocked: null,
    lastNetworkSwitchAt: null,
    providerType: null
  });

export const STATUS_PENDING = 'STATUS_PENDING';
export const STATUS_COMPLETED = 'STATUS_COMPLETED';
export const STATUS_ERROR = 'STATUS_ERROR';

export const PROVIDER_TYPE_METAMASK = 'PLATFORM/PROVIDER_TYPE_METAMASK';
export const PROVIDER_TYPE_PARITY = 'PLATFORM/PROVIDER_TYPE_PARITY';
export const PROVIDER_TYPE_MIST = 'PLATFORM/PROVIDER_TYPE_MIST';


const SET_PROVIDER_TYPE = 'PLATFORM/SET_PROVIDER_TYPE';
const SET_PLATFORM_ERRORS = 'PLATFORM/SET_PLATFORM_ERRORS';
const RESET_PLATFORM_ERRORS = 'PLATFORM/RESET_PLATFORM_ERRORS';
const WEB3_INITALIZED = 'PLATFORM/WEB3_INITALIZED';
const WEB3_RESET = 'PLATFORM/WEB3_RESET';
const WEB3_RESET_KEEP_SYNC = 'PLATFORM/WEB3_RESET_KEEP_SYNC';
const CONTRACTS_LOADED = 'PLATFORM/CONTRACTS_LOADED';
const CONTRACTS_RELOADED = 'PLATFORM/CONTRACTS_RELOADED';
const MARKET_INITIALIZED = 'PLATFORM/MARKET_INITIALIZED';
const MARKET_REINITIALIZED = 'PLATFORM/MARKET_REINITIALIZED';
const METAMASK_LOCKED = 'PLATFORM/METAMASK_LOCKED';
const METAMASK_UNLOCKED = 'PLATFORM/METAMASK_UNLOCKED';
const ACTIVE_NETWORK_CHANGED = 'PLATFORM/ACTIVE_NETWORK_CHANGED';


const INIT = 'PLATFORM/INIT';
const Init = createAction(
  INIT,
  async () => null,
);

const platformInitEpic = () => async (dispatch) => {
  dispatch(Init());
  dispatch(networkReducer.actions.subscribeLatestBlockFilterEpic());
};


const setProviderType = createAction(
  SET_PROVIDER_TYPE,
  providerType => providerType
);

const setPlatformErrors = createAction(
  SET_PLATFORM_ERRORS
);

const resetPlatformErrors = createAction(
  RESET_PLATFORM_ERRORS,
);

const web3Initialized = createAction(
  WEB3_INITALIZED,
  p => p,
);

const web3Reset = createAction(
  WEB3_RESET,
  () => window.web3.reset()
);
const web3ResetKeepSync = createAction(
  WEB3_RESET_KEEP_SYNC,
  () => window.web3.reset(true)
);

const contractsLoaded = createAction(
  CONTRACTS_LOADED,
  p => p,
);

const contractsReloaded = createAction(
  CONTRACTS_RELOADED,
);

const marketInitialized = createAction(
  MARKET_INITIALIZED,
);

const marketReinitialized = createAction(
  MARKET_REINITIALIZED,
);

const metamaskLocked = createAction(
  METAMASK_LOCKED,
);
const metamaskUnlocked = createAction(
  METAMASK_UNLOCKED,
);

const networkChanged = createAction(
  ACTIVE_NETWORK_CHANGED
);

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
  setProviderType
};

const reducer = handleActions({
  [contractsLoaded]: (state) => state.set('contractsLoaded', true),
  [marketInitialized]: (state) => state.set('marketInitialized', true),
  [web3Initialized]: (state) => state.set('web3Initialized', true),
  [metamaskLocked]: (state) => state.set('metamaskLocked', true),
  [metamaskUnlocked]: (state) => state.set('metamaskLocked', false),
  [networkChanged]: (state) => state.set('lastNetworkSwitchAt', Date.now()),
  [setProviderType]: (state, { payload }) => state.update('providerType', () => payload)

}, initialState);

export default {
  actions,
  reducer,
};
