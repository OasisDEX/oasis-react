import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import { fulfilled, pending, rejected } from '../../utils/store';
import { createPromiseActions } from '../../utils/createPromiseActions';
import tokens from '../selectors/tokens';

const initialState = Immutable.fromJS({
});

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
  Init
};

const reducer = handleActions({
  // [pending(loadOffers)]: state => state.set('loading', true),
  // [fulfilled(getLastOfferId)]: (state, { payload }) => state.set('lastOfferId', payload),
  // [fulfilled(loadOffers)]: (state, { payload }) => {
  //   console.log('offers', payload);
  //   return state;
  // }
}, initialState);

export default {
  actions,
  reducer,
};
