import { createSelector } from 'reselect';
import { Map, List } from 'immutable';
import tokens from './tokens';
import reselect from '../../utils/reselect';
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_PENDING } from '../../constants';
import web3 from '../../bootstrap/web3';

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
  (state, activeTradingPair) => state.getIn(['offers', Map(activeTradingPair), 'initialSyncStatus']) === SYNC_STATUS_PENDING
);

const activeTradingPairOffersInitiallyLoaded = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) => state.getIn(['offers', Map(activeTradingPair), 'initialSyncStatus']) === SYNC_STATUS_COMPLETED
);

const offersInitialized = createSelector(
  offers,
  state => state.get('offersInitialized')
);


const allOffers = createSelector(
  offers,
  state => state.get('offers')
);

const activeTradingPairBestBuyOfferId = createSelector(
  offers,
  state => state.getIn(['activeTradingPairBestOfferId', 'bestBuyOfferId'])
);

const activeTradingPairBestSellOfferId = createSelector(
  offers,
  state => state.getIn(['activeTradingPairBestOfferId', 'bestSellOfferId'])
);

const activeTradingPairOffersLoadProgress = createSelector(
  activeTradingPairBuyOfferCount,
  activeTradingPairSellOfferCount,
  activeTradingPairBuyOffers,
  activeTradingPairSellOffers,
  (buyOffersCount, sellOffersCount, buyOffers, sellOffers) => {
    if (buyOffersCount=== null || sellOffersCount === null) {
      return null
    } else {
      const loadedOffersCount = buyOffers.count() + sellOffers.count();
      const totalOffersCount =  buyOffersCount + sellOffersCount;
      return web3.toBigNumber(loadedOffersCount).div(totalOffersCount).mul(100).toFixed(0);
    }
  }
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
  allOffers,
  activeTradingPairBestBuyOfferId,
  activeTradingPairBestSellOfferId,
  activeTradingPairOffersLoadProgress
}