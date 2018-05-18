import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import {fulfilled} from '../../utils/store';

const initialState = fromJS({
  limitsLoaded: false,
  tokens: {
    'OW-ETH': { minSell: null },
    'W-ETH': { minSell: null },
    DAI: { minSell: null },
    SAI: { minSell: null },
    MKR: { minSell: null },
    DGD: { minSell: null },
    GNT: { minSell: null },
    'W-GNT': { minSell: null },
    REP: { minSell: null },
    ICN: { minSell: null },
    '1ST': { minSell: null },
    SNGLS: { minSell: null },
    VSL: { minSell: null },
    PLU: { minSell: null },
    MLN: { minSell: null },
    RHOC: { minSell: null },
    TIME: { minSell: null },
    GUP: { minSell: null },
    BAT: { minSell: null },
    NMR: { minSell: null },
  }
});


const init = createAction(
  'LIMITS/INIT',
  () => null,
);

/**
 *
 */
const getTokenMinSell = createAction(
  'LIMITS/GET_MIN_SELL',
  () => async () => {},
);

/**
 * Get min sell limits for all tokens traded.
 */
const getAllTradedTokenMinSellLimits = createAction(
  'LIMITS/GET_ALL_TRADED_TOKENS_MIN_SELL',
  async (marketContract, tokensContractsLists) =>
   Promise.all(
      Object.entries(tokensContractsLists).map(
        ([ , tokenContract]) => marketContract.getMinSell(tokenContract.address)
      )
   ).then( tokensMinSellLimits => {
     const limitsByTokenName = {};
     Object.keys(tokensContractsLists).forEach((key, i) => limitsByTokenName[key] = tokensMinSellLimits[i].toNumber() );
     return limitsByTokenName;
   })
);

const actions = {
  init,
  getTokenMinSell,
  getAllTradedTokenMinSellLimits
};

const reducer = handleActions({
  [fulfilled(getAllTradedTokenMinSellLimits)]: (state, {payload}) =>
    state.update('tokens',
      tokens => {
      Object.entries(payload).forEach(
        ([tokenName, tokenMinSell]) => tokens = tokens.setIn([tokenName, 'minSell'], tokenMinSell)
      );
        return tokens;
      }
    ).set('limitsLoaded', true)
}, initialState);

export default {
  actions,
  reducer,
};
