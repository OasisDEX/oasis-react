import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import web3, { web3p } from '../../bootstrap/web3';
import platformReducer from './platform';


const initialState = Immutable.fromJS({
  defaultAccount: null,
  accounts: [],
  lastAccountSwitchAt: null
});

const Init = createAction(
  'ACCOUNTS/INIT',
  () => null,
);

const checkAccounts = createAction(
  'ACCOUNTS/CHECK_ACCOUNTS',
  () => web3p.eth.getAccounts()
);

const setDefaultAccount = createAction(
  'ACCOUNTS/SET_DEFAULT_ACCOUNT',
  (address) => address
);

const setAccounts = createAction(
  'ACCOUNTS/SET_ACCOUNTS',
  (accounts) => accounts
);

const defaultAccountChanged = createAction(
  'ACCOUNTS/DEFAULT_ACCOUNT_CHANGED',
  () => Date.now().toString()
);

const checkAccountsEpic = () => async (dispatch, getState) => {
  const userAccounts = (await dispatch(checkAccounts())).value;
  const isMetamaskLocked = getState().getIn(['platform', 'accountLocked']);
  const hasUserAccounts = userAccounts.length;
  if(!hasUserAccounts) {
    if(!isMetamaskLocked) {
      dispatch(platformReducer.actions.accountLocked());
    }
    web3.eth.defaultAccount = undefined;
    return false;
  }
  else if (!userAccounts.find( acc => acc === web3.eth.defaultAccount)) {
    web3.eth.defaultAccount = userAccounts[0];
    dispatch(defaultAccountChanged());
    dispatch(setDefaultAccount(web3.eth.defaultAccount));
    dispatch(setAccounts(userAccounts));

    if(isMetamaskLocked) {
      dispatch(platformReducer.actions.accountUnlocked())
    } else {
      dispatch(platformReducer.actions.setGlobalFormLockEnabled());
    }
    sessionStorage.setItem('address', web3.eth.defaultAccount);
  }
  return true;
};

const actions = {
  Init,
  checkAccountsEpic,
  // setDefaultAccount,
  // defaultAccountChanged
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
