import {
  combineReducers,
} from 'redux-immutable';

import network  from './network';
import markets  from './markets';
import balances from './balances';
import orders   from './orders';
import history  from './history';

export default combineReducers({
  network:       network.reducer,
  markets:       markets.reducer,
  balances:      balances.reducer,
  orders:        orders.reducer,
  history:       history.reducer,
})
