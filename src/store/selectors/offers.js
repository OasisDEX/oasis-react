import { createSelector } from 'reselect';
import { Map, List } from 'immutable';
import tokens from './tokens';
import reselect from '../../utils/reselect';
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_PENDING, SYNC_STATUS_PRISTINE } from '../../constants';
import web3 from '../../bootstrap/web3';
import accounts from './accounts';
import findOffer from '../../utils/offers/findOffer';
import { OFFER_STATUS_INACTIVE } from '../reducers/offers';

const offers = state => state.get('offers');

const loadingBuyOffers = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, atp) => {
    return state.getIn(["offers", Map(atp), "loadingBuyOffers"]) !== SYNC_STATUS_COMPLETED
  }
);

const loadingSellOffers = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, atp) => state.getIn(["offers", Map(atp), 'loadingSellOffers']) !== SYNC_STATUS_COMPLETED
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
  (state, activeTradingPair) => state.hasIn(['offers', Map(activeTradingPair), 'initialSyncStatus'])
    ? state.getIn(['offers', Map(activeTradingPair), 'initialSyncStatus']) :
    SYNC_STATUS_PRISTINE
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

const activeTradingPairOffersData = createSelector(
  offers,
  tokens.activeTradingPair,
  (state, activeTradingPair) => state.getIn(['offers', Map(activeTradingPair)])
);

const tradingPairOffersData = createSelector(
  offers,
  reselect.getProps,
  (state, tradingPair) => state.getIn(['offers', Map(tradingPair)])
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

const canOfferBeCancelled = createSelector(
  (rootState, offerId) => {
    if (offerId) {
      const foundOffer = findOffer(offerId, rootState);
      if (foundOffer && foundOffer.offer && foundOffer.offer.status !== OFFER_STATUS_INACTIVE) {
        return foundOffer.offer.owner.toString() === accounts.defaultAccount(rootState).toString();
      } else {
        return false;
      }
    }
  },
  canCancel => Boolean(canCancel)
);

const reSyncOffersSet = createSelector(
  offers,
  s => s.get('reSyncOffersSet')
);

export default {
  state: offers,
  offersInitialized,
  loadingBuyOffers,
  loadingSellOffers,
  activeTradingPairBuyOffers,
  activeTradingPairSellOffers,
  activeTradingPairBuyOfferCount,
  activeTradingPairSellOfferCount,
  activeTradingPairOffersInitialLoadPending,
  activeTradingPairOffersInitiallyLoaded,
  activeTradingPairOffersInitialLoadStatus,
  activeTradingPairOffersData,
  tradingPairOffersData,
  tradingPairOffersInitialLoadStatus,
  allOffers,
  activeTradingPairBestBuyOfferId,
  activeTradingPairBestSellOfferId,
  activeTradingPairOffersLoadProgress,
  canOfferBeCancelled,
  reSyncOffersSet
}