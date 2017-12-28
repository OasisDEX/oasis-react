import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import networkReducer from './network';
import { fulfilled, pending, rejected } from '../../utils/store';
import { Session } from '../../utils/session';
import { MSGTYPE_INFO, MSGTYPE_WARNING } from '../../components/OasisMessage';
import { DAY, WEEK } from '../../utils/period';
import { ETH_UNIT_WEI } from '../../constants';

const initialState = Immutable.fromJS(
  {
    sids: [], // currently running setIntevals cancel ids
    errors: [],
    web3Initialized: null,
    contractsLoaded: false,
    metamaskLocked: false,
    lastNetworkSwitchAt: null,
    providerType: null,
    defaultTradingPair: {baseToken: 'MKR', quoteToken: 'W-ETH'},
    defaultPeriod: WEEK,
    defaultUnit: ETH_UNIT_WEI,
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
const WEB3_INITIALIZED = 'PLATFORM/WEB3_INITIALIZED';
const WEB3_RESET = 'PLATFORM/WEB3_RESET';
const WEB3_RESET_KEEP_SYNC = 'PLATFORM/WEB3_RESET_KEEP_SYNC';
const CONTRACTS_LOADED = 'PLATFORM/CONTRACTS_LOADED';
const CONTRACTS_RELOADED = 'PLATFORM/CONTRACTS_RELOADED';
const MARKET_INITIALIZED = 'PLATFORM/MARKET_INITIALIZED';
const MARKET_REINITIALIZED = 'PLATFORM/MARKET_REINITIALIZED';
const METAMASK_LOCKED = 'PLATFORM/METAMASK_LOCKED';
const METAMASK_UNLOCKED = 'PLATFORM/METAMASK_UNLOCKED';
const ACTIVE_NETWORK_CHANGED = 'PLATFORM/ACTIVE_NETWORK_CHANGED';

const DISMISS_MESSAGE = 'PLATFORM/DISMISS_MESSAGE';

const INIT = 'PLATFORM/INIT';
const Init = createAction(
  INIT,
  async () => null,
);

const platformInitEpic = () => async (dispatch) => {
  dispatch(Init());
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
  WEB3_INITIALIZED,
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


const dismissMessage = (
  msgType,
  dismissMessageAction = createAction(DISMISS_MESSAGE, msgType => msgType)
) => (dispatch) => {
  Session.dismissMessage(dispatch, msgType);
  dispatch(dismissMessageAction(msgType));
};

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
  setProviderType,
  dismissMessage
};

const reducer = handleActions({
  [contractsLoaded]: (state) => state.set('contractsLoaded', true),
  [marketInitialized]: (state) => state.set('marketInitialized', true),
  [web3Initialized]: (state) => state.set('web3Initialized', true),
  [metamaskLocked]: (state) => state.set('metamaskLocked', true),
  [metamaskUnlocked]: (state) => state.set('metamaskLocked', false),
  [networkChanged]: (state) => state.set('lastNetworkSwitchAt', Date.now()),
  [setProviderType]: (state, { payload }) => state.update('providerType', () => payload),
}, initialState);

export default {
  actions,
  reducer,
};
