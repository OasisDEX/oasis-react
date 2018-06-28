import { createSelector } from 'reselect';
import { List } from 'immutable';
import tokens from './tokens';

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

const tokenTrades = createSelector(
  marketHistory,
  tokens.activeTradingPair,
  (marketHistory, activeTradingPair) => {
    const tokens = [activeTradingPair.baseToken, activeTradingPair.quoteToken];
    return (marketHistory || List()).filter(t =>
      t.buyWhichToken == tokens[0] && t.sellWhichToken == tokens[1] ||
      t.buyWhichToken == tokens[1] && t.sellWhichToken == tokens[0]
    )
  },
)

const volumesLoaded = createSelector(
  trades,
  state => state.get('volumesLoaded')
);

export default {
  state: trades,
  marketsData,
  tokenTrades,
  initialMarketHistoryLoaded,
  volumesLoaded,
};
