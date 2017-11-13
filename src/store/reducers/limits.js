import { createAction, handleActions } from 'redux-actions';
import Immutable                       from 'immutable';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({ limitsLoaded: false });

const INIT = 'LIMITS/INIT';
const GET_MIN_SELL = 'LIMITS/GET_MIN_SELL';

const Init = createAction(
    INIT,
    () => null,
);

/**
 *
 */
const GetTokenMinSell = createAction(
    GET_MIN_SELL,
    () => async (sellToken) => {
      async function GetTokenMinSell(sellToken) {
      }
    },
);

/**
 * Get min sell limits for all tokens traded.
 */
const GetAllTradedTokenMinSellLimits = createAction(
    GET_MIN_SELL,
    () => async () => {
      async function GetAllTradedTokenMinSellLimits() {
      }
    },
);

const actions = {
  Init,
  GetTokenMinSell,
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
