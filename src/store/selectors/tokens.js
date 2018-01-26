import { createSelector } from 'reselect';
import widgets from './widgets';
import reselect from '../../utils/reselect';

const tokens = state => state.get('tokens');

const defaultTradingPair = createSelector(
  tokens,
  state => state.get('defaultTradingPair'),
);

const activeTradingPair = createSelector(
  tokens,
  state => state.get('activeTradingPair'),
);

const validBaseTokensList = createSelector(
  tokens,
  state => state.get('baseTokens'),
);

const validQuoteTokensList = createSelector(
  tokens,
  state => state.get('quoteTokens'),
);

const tradingPairs = createSelector(
  tokens,
  state => state.get('tradingPairs'),
);

const baseTokens = createSelector(
  tokens,
  state => state.get('tradingPairs').map(tp => tp.get('base')),
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


const getVisibleTradingPairs = createSelector(
  tokens,
  widgets.marketWidget,
  (state, marketWidget) => {
    if(marketWidget.get('isExpanded')) {
      return state.get('tradingPairs');
    } else {
      return state.get('tradingPairs').filter(tp => tp.get('isDefault'));
    }
  }
);

export default {
  state: tokens,
  getTokenSpecs,
  getVisibleTradingPairs,
  defaultTradingPair,
  activeTradingPair,
  validBaseTokensList,
  validQuoteTokensList,
  tradingPairs,
  getTokensSpecsObject,
  precision,
  baseTokens
};