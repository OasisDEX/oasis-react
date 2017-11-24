import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import web3 from '../../bootstrap/web3';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({});

const INIT = 'HISTORY/INIT';

const Init = createAction(
  INIT,
  () => null,
);

const actions = {};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
