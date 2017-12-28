import { createSelector } from 'reselect';

const markets = state => state.get('markets');

const marketCloseTime = createSelector(
  markets, (state) => parseInt(state.get('closeTime'))
);

const activeMarketAddress = createSelector(
  markets, (state) => state.get('activeMarketAddress')
);

export default {
  state: markets,
  marketCloseTime,
  activeMarketAddress
}