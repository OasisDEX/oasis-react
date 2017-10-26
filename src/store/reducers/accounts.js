import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({});

const INIT = 'ACCOUNTS/INIT';

const Init = createAction(
    INIT,
    () => null
);

const actions = {
  Init
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer
};
