import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import { BASE_TOKENS, QUOTE_TOKENS, TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../../constants';
import { generateTradingPairs } from '../../utils/generateTradingPairs';
import tokens from '../selectors/tokens';

const initialState = Immutable.fromJS({
  allTokens: [
    'W-ETH', 'MKR', 'DGD', 'GNT', 'W-GNT', 'REP',
    'ICN', '1ST', 'SNGLS', 'VSL', 'PLU', 'MLN',
    'RHOC', 'TIME', 'GUP', 'BAT', 'NMR', 'SAI',
  ],
  baseTokens: BASE_TOKENS,
  quoteTokens: QUOTE_TOKENS,
  precision: null,
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
  defaultTradingPair: { baseToken: TOKEN_MAKER, quoteToken: TOKEN_WRAPPED_ETH },
  activeTradingPair: null,
});

const INIT = 'TOKENS/INIT';
const SET_DEFAULT_TOKEN_PAIR = 'TOKENS/SET_DEFAULT_TOKEN_PAIR';

const Init = createAction(
  INIT,
  () => null,
);

const setDefaultTradingPair = createAction(
  SET_DEFAULT_TOKEN_PAIR,
  (baseToken, quoteToken) => ({ baseToken, quoteToken }),
);

const setActiveTradingPair = createAction(
  'TOKENS/SET_ACTIVE_TOKEN_PAIR',
  tradingPair => tradingPair
);


const setPrecision = createAction(
  'TOKENS/SET_PRECISION', precision => precision
);

const denotePrecision = () => (dispatch, getState) => {
  const { baseToken, quoteToken } = tokens.activeTradingPair(getState());
  const basePrecision = tokens.getTokenSpecs(getState(), baseToken).get('precision');
  const quotePrecision = tokens.getTokenSpecs(getState(), quoteToken).get('precision');
  const precision = basePrecision < quotePrecision ? basePrecision : quotePrecision;
  dispatch(setPrecision(precision));
  // Session.set('precision', precision);
  // // TODO: find away to place ROUNDING_MODE in here.
  // // Right now no matter where It is put , it's overridden with ROUNDING_MODE: 1 from web3 package config.
  // BigNumber.config({ DECIMAL_PLACES: precision });
};


const actions = {
  Init,
  setDefaultTradingPair,
  setActiveTradingPair,
  denotePrecision
};

const reducer = handleActions({
  [setDefaultTradingPair]: (state, { payload }) =>
    state.update('defaultTradingPair', () => payload),
  [setActiveTradingPair]:(state, { payload }) => state.set('activeTradingPair', payload),
  [setPrecision]: (state, { payload }) => state.set('precision', payload),
}, initialState);

export default {
  actions,
  reducer,
};
