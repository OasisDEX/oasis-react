import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const initialState = fromJS({});

const INIT = 'TOKEN_SELECTORS/INIT';

const Init = createAction(
  INIT,
  () => null,
);

const registerTokenSelector = createAction(
  'TOKEN_SELECTORS/REGISTER_TOKEN_SELECTOR',
  (tokenSelectorName, initialValue) =>  ({ tokenSelectorName, initialValue })
);

const unregisterTokenSelector = createAction(
  'TOKEN_SELECTORS/UNREGISTER_TOKEN_SELECTOR',
  tokenSelectorName => tokenSelectorName
);

const tokenSelected = createAction(
  'TOKEN_SELECTORS/TOKEN_SELECTED',
  (tokenSelectorName, token) => ({tokenSelectorName, token})
);


/**
 * Get min sell limits for all tokens traded.
 */

const actions = {
  Init,
  registerTokenSelector,
  unregisterTokenSelector,
  tokenSelected
};

const reducer = handleActions({
  [registerTokenSelector]: (state, { payload: { tokenSelectorName, initialValue } }) =>
    state.has(tokenSelectorName) ? state : state.set(tokenSelectorName, initialValue),
  [unregisterTokenSelector]: (state, payload) => state.delete(payload),
  [tokenSelected]: (state, { payload: { tokenSelectorName, token } }) => state.set(tokenSelectorName, token)

}, initialState);

export default {
  actions,
  reducer,
};
