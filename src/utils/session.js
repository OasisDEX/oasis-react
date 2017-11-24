import sessionReducer from './../store/reducers/session';

let getState = null;

export const Session = {
  init: (getStateFunction) => {
    getState = getStateFunction;
  },
  get: (sessionKey) =>
    getState().getIn(['session', sessionKey]),
  set: (dispatchFunction, key, value) => {
    dispatchFunction(sessionReducer.actions.SetValue(key, value));
  },
};