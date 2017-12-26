import { createSelector } from 'reselect';

const state = s => s.get('trades');

const initialMarketHistoryLoaded = createSelector(
  state, s => s.get('initialMarketHistoryLoaded'),
);


const marketHistory = createSelector(
  state,
  (s) => s.get('marketHistory')
);

const marketsData = createSelector(
  state,
  initialMarketHistoryLoaded,
  marketHistory,
  (s, initialMarketHistoryLoaded, marketHistory) => {
    if (initialMarketHistoryLoaded) {
      return marketHistory;
    }
  },
);

const volumesLoaded = createSelector(
  state, s => s.get('volumesLoaded')
);

export default {
  state,
  marketsData,
  initialMarketHistoryLoaded,
  volumesLoaded,
};