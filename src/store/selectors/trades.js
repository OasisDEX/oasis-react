import { createSelector } from 'reselect';

const trades = state => state.get('trades');

const initialMarketHistoryLoaded = createSelector(
  trades, state => state.get('initialMarketHistoryLoaded'),
);


const marketHistory = createSelector(
  trades,
  state => state.get('marketHistory')
);

const marketsData = createSelector(
  trades,
  initialMarketHistoryLoaded,
  marketHistory,
  (s, initialMarketHistoryLoaded, marketHistory) => {
    if (initialMarketHistoryLoaded) {
      return marketHistory;
    }
  },
);

const volumesLoaded = createSelector(
  trades,
  state => state.get('volumesLoaded')
);

export default {
  state: trades,
  marketsData,
  initialMarketHistoryLoaded,
  volumesLoaded,
};