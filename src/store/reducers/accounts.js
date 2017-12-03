import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import web3 from '../../bootstrap/web3';
import { Session } from '../../utils/session';
import platformReducer from './platform';
import sessionReducer from './session';


const initialState = Immutable.fromJS({
  defaultAccount: null,
  accounts: []
});

const INIT = 'ACCOUNTS/INIT';
const CHECK_ACCOUNTS = 'NETWORK/CHECK_ACCOUNTS';

const Init = createAction(
  INIT,
  () => null,
);



const checkAccounts = createAction(
  CHECK_ACCOUNTS,
  () => window.web3p.eth.getAccounts(),
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
  }
  else if (!userAccounts.find( acc => acc === window.web3.eth.defaultAccount)) {
    if ((userAccounts.find( acc => acc === localStorage.getItem('address')) )) {
      window.web3.eth.defaultAccount = localStorage.getItem('address');
    } else if (userAccounts.find( acc => acc === Session.get('address'))) {
      window.web3.eth.defaultAccount = Session.get('address');
    } else if (userAccounts.length > 0) {
      window.web3.eth.defaultAccount = userAccounts[0];
    } else {
      throw new Error('No default account');
    }
  }

  if(isMetamaskLocked) {
    dispatch(platformReducer.actions.metamaskUnlocked())
  }
  localStorage.setItem('address', web3.eth.defaultAccount);
  dispatch(sessionReducer.actions.SetValue('address', window.web3.eth.defaultAccount));
  dispatch(sessionReducer.actions.SetValue('accounts', userAccounts))
};


const actions = {
  Init,
  checkAccountsEpic
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
