import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import web3 from '../../bootstrap/web3';
import { Session } from '../../utils/session';
import platformReducer from './platform';
import sessionReducer from './session';


const initialState = Immutable.fromJS({
  defaultAccount: null,
  accounts: [],
  lastAccountSwitchAt: null
});

const INIT = 'ACCOUNTS/INIT';
const CHECK_ACCOUNTS = 'ACCOUNTS/CHECK_ACCOUNTS';
const SET_DEFAULT_ACCOUNT = 'ACCOUNTS/SET_DEFAULT_ACCOUNT';
const SET_ACCOUNTS = 'ACCOUNTS/SET_ACCOUNTS';
const DEFAULT_ACCOUNT_CHANGED = 'ACCOUNTS/DEFAULT_ACCOUNT_CHANGED';

const Init = createAction(
  INIT,
  () => null,
);


const checkAccounts = createAction(
  CHECK_ACCOUNTS,
  () => window.web3p.eth.getAccounts()
);

const setDefaultAccount = createAction(
  SET_DEFAULT_ACCOUNT,
  (address) => address
);

const setAccounts = createAction(
  SET_ACCOUNTS,
  (accounts) => accounts
);

const defaultAccountChanged = createAction(
  DEFAULT_ACCOUNT_CHANGED,
  () => Date.now() / 1000
);

const checkAccountsEpic = () => async (dispatch, getState) => {
  const userAccounts = (await dispatch(checkAccounts())).value;
  const isMetamaskLocked = getState().getIn(['platform', 'metamaskLocked']);
  const hasUserAccounts = userAccounts.length;
  if(!hasUserAccounts) {
    if(!isMetamaskLocked) {
      dispatch(platformReducer.actions.metamaskLocked());
    }
    window.web3.eth.defaultAccount = undefined;
    return false;
  }
  else if (!userAccounts.find( acc => acc === window.web3.eth.defaultAccount)) {
    window.web3.eth.defaultAccount = userAccounts[0];
    dispatch(defaultAccountChanged());
    dispatch(setDefaultAccount(window.web3.eth.defaultAccount));
    dispatch(setAccounts(userAccounts));
    if(isMetamaskLocked) {
      dispatch(platformReducer.actions.metamaskUnlocked())
    }
    sessionStorage.setItem('address', web3.eth.defaultAccount);
  }
  return true;
};


const actions = {
  Init,
  checkAccountsEpic,
  setDefaultAccount,
  defaultAccountChanged
};

const reducer = handleActions({
  [setDefaultAccount]: (state, { payload }) => state.set('defaultAccount', payload),
  [defaultAccountChanged]: (state, { payload }) => state.set('lastAccountSwitchAt', payload),
  [setAccounts]: (state, { payload }) => state.set('accounts', payload)
}, initialState);

export default {
  actions,
  reducer,
};
