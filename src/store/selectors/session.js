import { createSelector } from 'reselect';

const session = state => state.get('session');

const messages = createSelector(
  session,
  state => {
    if(state.hasIn(['persist', 'messages'])) {
      return state.getIn(['persist', 'messages']).toJSON()
    }
  }
);

const sessionData = createSelector(
  session,
  state => state.getIn(['session']).toJSON()
);

const persistentData = createSelector(
  session,
  state => state.getIn(['persist']).toJSON()
);

const isSessionInitialized = createSelector(
  session,
  state => state.get('initialized')
);

export default {
  state: session,
  persistentData,
  sessionData,
  messages,
  isSessionInitialized
};