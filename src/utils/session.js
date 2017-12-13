import sessionReducer from './../store/reducers/session';
import accounts from '../store/selectors/accounts';
import session from '../store/selectors/session';
import { fromJS } from 'immutable';

let getState = null;

export const Session = {

  init: (dispatch, getStateFunction) => {
    getState = getStateFunction;
    dispatch(sessionReducer.actions.resetSession());
    const defaultAccount = accounts.defaultAccount(getState());
    const accountSessionData = sessionStorage.getItem(defaultAccount);
    const accountPersistentData = localStorage.getItem(defaultAccount);
    if(accountPersistentData) {
      dispatch(
        sessionReducer.actions.loadSavedPersistentData( fromJS(JSON.parse(accountPersistentData))));
    } else {
      localStorage.setItem(defaultAccount, JSON.stringify(session.persistentData(getState())));
    }

    if(accountSessionData) {
      dispatch(
        sessionReducer.actions.loadSavedSessionData(fromJS(JSON.parse(accountSessionData)))
      );
    } else {
      sessionStorage.setItem(defaultAccount, JSON.stringify(session.sessionData(getState())));
    }
    dispatch(sessionReducer.actions.init());
  },

  getSession: (sessionKey) => getState().getIn(['session', 'session', sessionKey]),
  getPersistent: (sessionKey) => getState().getIn(['session', 'persist', sessionKey]),


  set: (dispatchFunction, key, value) => {
    dispatchFunction(sessionReducer.actions.SetValue(key, value));
    sessionStorage.setItem(
      window.web3.eth.defaultAccount, JSON.stringify(getState().getIn(['session','session']).toJSON()),
    );
  },
  setPersistent: (dispatchFunction, key, value) => {
    dispatchFunction(sessionReducer.actions.SetValue(key, value));
    localStorage.setItem(
      window.web3.eth.defaultAccount, JSON.stringify(getState().getIn(['session', 'persist']).toJSON()),
    );
  },

  dismissMessage: (dispatchFunction, msgType) => {
    dispatchFunction(sessionReducer.actions.dismissMessage(msgType));
    localStorage.setItem(
      window.web3.eth.defaultAccount, JSON.stringify(getState().getIn(['session', 'persist']).toJSON())
    );
  },

};