import { createSelector } from "reselect";

const userTrades = state => state.get("userTrades");

const initialMarketHistoryLoaded = createSelector(
  userTrades, state => state.get("initialMarketHistoryLoaded")
);

const marketHistory = createSelector(userTrades, state =>
  state.get("marketHistory")
);

const marketsData = createSelector(
  userTrades,
  initialMarketHistoryLoaded,
  marketHistory,
  (s, initialMarketHistoryLoaded, marketHistory) => {
    if (initialMarketHistoryLoaded) {
      return marketHistory;
    }
  }
);

const volumesLoaded = createSelector(userTrades, state =>
  state.get("volumesLoaded")
);

const loadindUserMarketHistory = createSelector(
  userTrades, s => s.get("loadingUserMarketHistory")
);

export default {
  state: userTrades,
  marketsData,
  initialMarketHistoryLoaded,
  volumesLoaded,
  loadindUserMarketHistory
};
