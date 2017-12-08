import { createSelector } from 'reselect';

const state = s => s.get('markets');

const marketCloseTime = createSelector(
  state, (s) => parseInt(s.get('closeTime'))
);

const activeMarketAddress = createSelector(
  state, (s) => s.get('activeMarketAddress')
);

export default {
  state,
  marketCloseTime,
  activeMarketAddress
}