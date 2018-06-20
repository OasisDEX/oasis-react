import sessionReducer from './../store/reducers/session';
import accounts from '../store/selectors/accounts';
import session from '../store/selectors/session';
import { fromJS } from 'immutable';
import web3 from '../bootstrap/web3';

let getState = null;

export const Session = {

  init: (dispatch, getStateFunction) => {
    getState = getStateFunction;
    dispatch(sessionReducer.actions.resetSession());
    const defaultAccountHash = web3.sha3(accounts.defaultAccount(getState()));
    const accountSessionData = sessionStorage.getItem(defaultAccountHash);
    const accountPersistentData = localStorage.getItem(defaultAccountHash);
    if(accountPersistentData) {
      dispatch(
        sessionReducer.actions.loadSavedPersistentData( fromJS(JSON.parse(accountPersistentData))));
    } else {
      localStorage.setItem(defaultAccountHash, JSON.stringify(session.persistentData(getState())));
    }

    if(accountSessionData) {
      dispatch(
        sessionReducer.actions.loadSavedSessionData(fromJS(JSON.parse(accountSessionData)))
      );
    } else {
      sessionStorage.setItem(defaultAccountHash, JSON.stringify(session.sessionData(getState())));
    }
    dispatch(sessionReducer.actions.init());
  },

  getSession: (sessionKey) => getState().getIn(['session', 'session', sessionKey]),
  getPersistent: (sessionKey) => getState().getIn(['session', 'persist', sessionKey]),


  set: (dispatchFunction, key, value) => {
    dispatchFunction(sessionReducer.actions.SetValue(key, value));
    sessionStorage.setItem(
      web3.eth.defaultAccount, JSON.stringify(getState().getIn(['session','session']).toJSON()),
    );
  },
  setPersistent: (dispatchFunction, key, value) => {
    dispatchFunction(sessionReducer.actions.SetValue(key, value));
    localStorage.setItem(
      web3.sha3(web3.eth.defaultAccount), JSON.stringify(getState().getIn(['session', 'persist']).toJSON()),
    );
  },

  dismissMessage: (dispatchFunction, msgType) => {
    dispatchFunction(sessionReducer.actions.dismissMessage(msgType));
    localStorage.setItem(
      web3.sha3(web3.eth.defaultAccount), JSON.stringify(getState().getIn(['session', 'persist']).toJSON())
    );
  },

};