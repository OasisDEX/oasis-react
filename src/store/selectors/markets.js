import { createSelector } from 'reselect';

const markets = state => state.get('markets');

const marketCloseTime = createSelector(
  markets, (state) => parseInt(state.get('closeTime'))
);

const activeMarketAddress = createSelector(
  markets, (state) => state.get('activeMarketAddress')
);

const isBuyEnabled = createSelector(
  markets, s => s.get('isBuyEnabled')
);

const activeMarketOriginBlock = createSelector(
  markets, s => s.get('activeMarketOriginBlock')
);

export default {
  state: markets,
  marketCloseTime,
  activeMarketAddress,
  isBuyEnabled,
  activeMarketOriginBlock
}