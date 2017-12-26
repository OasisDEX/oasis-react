import { createSelector } from 'reselect';
import widgets from './widgets';
import reselect from '../../utils/reselect';

const state = s => s.get('tokens');

const defaultTokenPair = createSelector(
  state,
  s => s.get('defaultTokenPair'),
);

const activeTokenPair = createSelector(
  state,
  s => s.get('activeTokenPair'),
);

const validBaseTokensList = createSelector(
  state,
  s => s.get('baseTokens'),
);

const validQuoteTokensList = createSelector(
  state,
  s => s.get('quoteTokens'),
);

const tradingPairs = createSelector(
  state,
  s => s.get('tradingPairs'),
);

const getTokenSpecs = createSelector(
  state,
  reselect.getProps,
  (s, p) => {
    console.log({s, p}, s.getIn(['tokenSpecs', p]));
    return s.getIn(['tokenSpecs', p])
  }
);

const getVisibleTokenPairs = createSelector(
  state,
  widgets.marketWidget,
  (s, marketWidget) => {
    if(marketWidget.get('isExpanded')) {
      return s.get('tradingPairs');
    } else {
      return s.get('tradingPairs').filter(tp => tp.get('isDefault'));
    }
  }
);

export default {
  state,
  getTokenSpecs,
  getVisibleTokenPairs,
  defaultTokenPair,
  activeTokenPair,
  validBaseTokensList,
  validQuoteTokensList,
  tradingPairs,
};