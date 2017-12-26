import { createSelector } from 'reselect';

const state = s => s.get('widgets');

const marketWidget = createSelector(
  state,
  (s) => s.get('OasisMarketWidget')
);

export default {
  state,
  marketWidget
};