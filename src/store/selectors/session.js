import { createSelector } from 'reselect';

const state = s => s.get('session');

const messages = createSelector(
  state,
  s => {
    if(s.hasIn(['persist', 'messages'])) {
      return s.getIn(['persist', 'messages']).toJSON()
    }
  }
);

const sessionData = createSelector(
  state,
  s => s.getIn(['session']).toJSON()
);

const persistentData = createSelector(
  state,
  s => s.getIn(['persist']).toJSON()
);

const isSessionInitialized = createSelector(
  state,
  s => s.get('initialized')
);

export default {
  state,
  persistentData,
  sessionData,
  messages,
  isSessionInitialized
};