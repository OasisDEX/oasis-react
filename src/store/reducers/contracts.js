import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

const initialState = Immutable.fromJS({});

const INIT = 'CONTRACTS/INIT';

const Init = createAction(
  INIT,
  () => null,
);

const actions = {
  Init,
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
