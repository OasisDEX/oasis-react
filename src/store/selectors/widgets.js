import { createSelector } from 'reselect';

const widgets = state => state.get('widgets');

const marketWidget = createSelector(
  widgets,
  (s) => s.get('OasisMarketWidget')
);

export default {
  state: widgets,
  marketWidget
};