import { createSelector } from 'reselect';

const state = s => s.get('tokens');

const defaultTokenPair = createSelector(
  state,
  s => s.get('defaultTokenPair')
);

const activeTokenPair = createSelector(
  state,
  s => s.get('activeTokenPair')
);

const validBaseTokensList = createSelector(
  state,
  s => s.get('baseTokens')
);

const validQuoteTokensList = createSelector(
  state,
  s => s.get('quoteTokens')
);

export default {
  state,
  defaultTokenPair,
  activeTokenPair,
  validBaseTokensList,
  validQuoteTokensList
};