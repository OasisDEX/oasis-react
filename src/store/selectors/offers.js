import { createSelector } from 'reselect';
import { Map, List } from 'immutable';
import tokens from './tokens';
import { STATUS_COMPLETED, STATUS_PENDING } from '../reducers/platform';
import reselect from '../../utils/reselect';

const offers = state => state.get('offers');

// const loadingBuyOffers = createSelector(
//   offers,
//   state => state.get('loadingBuyOffers')
// );
//
// const loadingSellOffers = createSelector(
//   offers,
//   state => state.get('loadingSellOffers')
// );

const activeTradingPairBuyOffers = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) =>
    state.getIn(['offers', Map(activeTradingPair), 'buyOffers']) || List()
);

const activeTradingPairSellOffers = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) => state.getIn(['offers', Map(activeTradingPair), 'sellOffers']) || List()
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


const tradingPairOffersInitialLoadStatus = createSelector(
  offers,
  reselect.getProps,
  (state, { baseToken, quoteToken }) =>
    state.getIn(['offers', Map({ baseToken, quoteToken }), 'initialSyncStatus'])
);


const activeTradingPairOffersInitialLoadStatus = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) =>
    state.getIn(['offers', Map(activeTradingPair), 'initialSyncStatus'])
);

const activeTradingPairOffersInitialLoadPending = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) => state.getIn(['offers', Map(activeTradingPair), 'initialSyncStatus']) === STATUS_PENDING
);

const activeTradingPairOffersInitiallyLoaded = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) => state.getIn(['offers', Map(activeTradingPair), 'initialSyncStatus']) === STATUS_COMPLETED
);

const offersInitialized = createSelector(
  offers,
  state => state.get('offersInitialized')
);


const allOffers = createSelector(
  offers,
  state => state.get('offers')
);

export default {
  state: offers,
  offersInitialized,
  // loadingBuyOffers,
  // loadingSellOffers,
  activeTradingPairBuyOffers,
  activeTradingPairSellOffers,
  activeTradingPairBuyOfferCount,
  activeTradingPairSellOfferCount,
  activeTradingPairOffersInitialLoadPending,
  activeTradingPairOffersInitiallyLoaded,
  activeTradingPairOffersInitialLoadStatus,
  tradingPairOffersInitialLoadStatus,
  allOffers
}