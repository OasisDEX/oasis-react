import { createSelector } from 'reselect';
import { Map, List } from 'immutable';
import tokens from './tokens';
import trades from './trades';

const offers = state => state.get('offers');


const loadingBuyOffers = createSelector(
  offers,
  state => state.get('loadingBuyOffers')
);

const loadingSellOffers = createSelector(
  offers,
  state => state.get('loadingSellOffers')
);

const activeTradingPairBuyOffers = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) =>
    state.getIn(['offers', Map(activeTradingPair), 'buyOffers']) || List()
);

const activeTradingPairSellOffers = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) =>
    state.getIn(['offers', Map(activeTradingPair), 'sellOffers']) || List()
);

const activeTradingPairBuyOfferCount = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) => state.getIn(['offers', Map(activeTradingPair), 'buyOfferCount'])
);

const activeTradingPairSellOfferCount = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) => state.getIn(['offers', Map(activeTradingPair), 'sellOfferCount'])
);

const getUserClosedOffers = createSelector(
  trades.marketsData,
  tokens.activeTradingPair,
  (trades, activeTradingPair) => trades.getIn(['offers', Map(activeTradingPair), 'sellOfferCount'])
);

const getUserOpenOffers = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) => state.getIn(['offers', Map(activeTradingPair), 'sellOfferCount'])
);



export default {
  state: offers,
  loadingBuyOffers,
  loadingSellOffers,
  activeTradingPairBuyOffers,
  activeTradingPairSellOffers,
  activeTradingPairBuyOfferCount,
  activeTradingPairSellOfferCount,
  getUserOpenOffers,
  getUserClosedOffers
}