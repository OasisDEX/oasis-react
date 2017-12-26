import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import { BASE_TOKENS, QUOTE_TOKENS, TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../../constants';
import { generateTradingPairs } from '../../utils/generateTradingPairs';

const initialState = Immutable.fromJS({
  allTokens: [
    'W-ETH', 'MKR', 'DGD', 'GNT', 'W-GNT', 'REP',
    'ICN', '1ST', 'SNGLS', 'VSL', 'PLU', 'MLN',
    'RHOC', 'TIME', 'GUP', 'BAT', 'NMR', 'SAI',
  ],
  baseTokens: BASE_TOKENS,
  quoteTokens: QUOTE_TOKENS,
  tradingPairs: generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS),
  tokenSpecs: {
    'OW-ETH': { precision: 18, format: '0,0.00[0000000000000000]' },
    'W-ETH': { precision: 18, format: '0,0.00[0000000000000000]' },
    DAI: { precision: 18, format: '0,0.00[0000000000000000]' },
    SAI: { precision: 18, format: '0,0.00[0000000000000000]' },
    MKR: { precision: 18, format: '0,0.00[0000000000000000]' },
    DGD: { precision: 9, format: '0,0.00[0000000]' },
    GNT: { precision: 18, format: '0,0.00[0000000000000000]' },
    'W-GNT': { precision: 18, format: '0,0.00[0000000000000000]' },
    REP: { precision: 18, format: '0,0.00[0000000000000000]' },
    ICN: { precision: 18, format: '0,0.00[0000000000000000]' },
    '1ST': { precision: 18, format: '0,0.00[0000000000000000]' },
    SNGLS: { precision: 0, format: '0,0' },
    VSL: { precision: 18, format: '0,0.00[0000000000000000]' },
    PLU: { precision: 18, format: '0,0.00[0000000000000000]' },
    MLN: { precision: 18, format: '0,0.00[0000000000000000]' },
    RHOC: { precision: 8, format: '0,0.00[000000]' },
    TIME: { precision: 8, format: '0,0.00[000000]' },
    GUP: { precision: 3, format: '0,0.00[0]' },
    BAT: { precision: 18, format: '0,0.00[0000000000000000]' },
    NMR: { precision: 18, format: '0,0.00[0000000000000000]' },
  },
  defaultTokenPair: { baseToken: TOKEN_MAKER, quoteToken: TOKEN_WRAPPED_ETH },
  activeTokenPair: null,
});

const INIT = 'TOKENS/INIT';
const SET_DEFAULT_TOKEN_PAIR = 'TOKENS/SET_DEFAULT_TOKEN_PAIR';

const Init = createAction(
  INIT,
  () => null,
);

const setDefaultTokenPair = createAction(
  SET_DEFAULT_TOKEN_PAIR,
  (baseToken, quoteToken) => ({ baseToken, quoteToken }),
);

const setActiveTokenPair = createAction(
  'TOKENS/SET_ACTIVE_TOKEN_PAIR',
  tokenPair => tokenPair
);

const actions = {
  Init,
  setDefaultTokenPair,
  setActiveTokenPair
};

const reducer = handleActions({
  [setDefaultTokenPair]: (state, { payload }) =>
    state.update('defaultTokenPair', () => payload),
  [setActiveTokenPair]:(state, { payload }) => state.set('activeTokenPair', payload)
}, initialState);

export default {
  actions,
  reducer,
};
