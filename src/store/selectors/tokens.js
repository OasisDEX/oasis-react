import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';

const tokens = state => state.get('tokens');

const defaultTradingPair = createSelector(
  tokens,
  state => state.get('defaultTradingPair'),
);

const activeTradingPair = createSelector(
  tokens,
  state =>
    state.get('activeTradingPair') && state.get('activeTradingPair').toJS ?
      state.get('activeTradingPair').toJS() :
      state.get('activeTradingPair'),
);

const validBaseTokensList = createSelector(
  tokens,
  state => state.get('baseTokens'),
);

const allTokens = createSelector(
  tokens,
  state => state.get('allTokens').sort(),
);


const validQuoteTokensList = createSelector(
  tokens,
  state => state.get('quoteTokens'),
);

const tradingPairs = createSelector(
  tokens,
  state => state.get('tradingPairs'),
);

const defaultBaseToken = createSelector(
  tokens,
  state => state.get('defaultBaseToken'),
);

const defaultQuoteToken = createSelector(
  tokens,
  state => state.get('defaultQuoteToken'),
);

const baseTokens = createSelector(
  tokens,
  state => state.get('tradingPairs').map(tp => tp.get('base')).toSet().sort(),
);

const getTokenSpecs = createSelector(
  tokens,
  reselect.getProps,
  (state, props) => state.getIn(['tokenSpecs', props])
);

const getTokensSpecsObject = createSelector(
  tokens,
  state => state.get('tokenSpecs')
);

const precision = createSelector(
  tokens,
  state => state.get('precision')
);

const activeTradingPairBaseToken = createSelector(
  tokens, s => s.getIn(['activeTradingPair']).baseToken
);

const activeTradingPairQuoteToken = createSelector(
  tokens, s => s.getIn(['activeTradingPair']).quoteToken
);

const getErc20Tokens = createSelector(
  tokens, s => s.get('erc20Tokens'),
);

export default {
  state: tokens,
  getTokenSpecs,
  defaultBaseToken,
  defaultQuoteToken,
  defaultTradingPair,
  activeTradingPair,
  validBaseTokensList,
  validQuoteTokensList,
  tradingPairs,
  getTokensSpecsObject,
  precision,
  baseTokens,
  allTokens,
  activeTradingPairBaseToken,
  activeTradingPairQuoteToken,
  getErc20Tokens
};