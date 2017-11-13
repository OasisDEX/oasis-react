import { createAction, handleActions } from 'redux-actions';
import Immutable                       from 'immutable';
import web3                            from '../../bootstrap/web3';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({});

const INIT = 'ORDERS/INIT';

const STATUS_PENDING = 'ORDERS/STATUS_PENDING';
const STATUS_CONFIRMED = 'ORDERS/STATUS_CONFIRMED';
const STATUS_CANCELLED = 'ORDERS/STATUS_CANCELLED';
const STATUS_FILLED = 'ORDERS/STATUS_FILLED';
const STATUS_OPEN = 'ORDERS/STATUS_OPEN';
const STATUS_CLOSED = 'ORDERS/STATUS_CLOSED';

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
