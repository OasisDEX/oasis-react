/* eslint-disable no-unused-vars */
import { createAction, handleActions } from 'redux-actions';
import { fromJS, List, Map } from 'immutable';

import { fulfilled, pending } from '../../utils/store';
import tokens from '../selectors/tokens';
import network from '../selectors/network';
import offers from '../selectors/offers';
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_ERROR, SYNC_STATUS_PENDING, SYNC_STATUS_PRISTINE } from '../../constants';
import {offerCompletelyFilledIn, setOffer, setOfferEpic} from './offers/setOfferEpic';
import {loadBuyOffers, loadBuyOffersEpic, loadSellOffers, loadSellOffersEpic} from './offers/loadOffers';
import {getTradingPairOfferCount} from './offers/getTradingPairOffersCount';
import {
  cancelOfferEpic,
  loadOffer,
  syncOffers,
  syncOffersEpic,
  updateOffer,
} from './offers/syncOffersEpic';
import {syncOffer} from './offers/syncOfferEpic';
import {
  offerCancelledEvent,
  removeOrderCancelledByTheOwner,
  subscribeCancelledOrdersEpic,
} from './offers/subscribeCancelledOffersEpic';
import {
  getBestOfferIdsForActiveTradingPairEpic,
  setActiveTradingPairBestOfferIds,
} from './offers/getBestOfferIdsForActiveTradingPairEpic';
import {
  checkOfferIsActive,
  markOfferAsInactive,
  removeOfferFromTheOrderBook,
  subscribeFilledOffersEpic,
} from './offers/subscribeFilledOffersEpic';
import {subscribeNewOffersFilledInEpic} from './offers/subscribeNewOffersFilledInEpic';

export const TYPE_BUY_OFFER = 'OFFERS/TYPE_BUY';
export const TYPE_SELL_OFFER = 'OFFERS/TYPE_SELL';

const initialState = fromJS({
  offers: {},
  syncingOffers: [],
  pendingOffers: [],
  initialSyncStatus: {},
  loadingSellOffers: {},
  loadingBuyOffers: {},
  offersInitialized: false,
  activeTradingPairBestOfferId : {}
});


export const BUY_GAS = 1000000;
export const CANCEL_GAS = 1000000;

export const OFFER_SYNC_TYPE_INITIAL = 'OFFERS/OFFER_SYNC_TYPE_INITIAL';
export const OFFER_SYNC_TYPE_UPDATE = 'OFFERS/OFFER_SYNC_TYPE_UPDATE';
export const OFFER_SYNC_TYPE_NEW_OFFER = 'OFFERS/OFFER_SYNC_NEW_OFFER';
export const OFFER_STATUS_INACTIVE = 'OFFERS/OFFER_STATUS_INACTIVE';


const subscribeOffersEventsEpic = () => async (dispatch, getState) => {
  const latestBlockNumber = network.latestBlockNumber(getState());
  dispatch(
    subscribeNewOffersFilledInEpic(latestBlockNumber),
  );
  dispatch(
    subscribeFilledOffersEpic(latestBlockNumber),
  );
  dispatch(
    subscribeCancelledOrdersEpic(latestBlockNumber),
  );

};

const initOffers = createAction('OFFERS/INIT_OFFERS', initialOffersState => initialOffersState);
const initOffersEpic = () => (dispatch, getState) => {
  let initialOffersData = Map({});
  const initialTradingPairData = fromJS({
    buyOfferCount: null,
    sellOfferCount: null,
    buyOffers: List(),
    sellOffers: List(),
    initialSyncStatus: SYNC_STATUS_PRISTINE,
  });
  tokens.tradingPairs(getState())
    .forEach(tp =>
      initialOffersData = initialOffersData
        .set(
          Map({ baseToken: tp.get('base'), quoteToken: tp.get('quote') }),
          initialTradingPairData,
        ),
    );
  dispatch(initOffers(initialOffersData));
};

const actions = {
  initOffersEpic,
  cancelOfferEpic,
  syncOffersEpic,
  subscribeOffersEventsEpic,
  checkOfferIsActive,
  getBestOfferIdsForActiveTradingPairEpic,
  markOfferAsInactive,
  removeOrderCancelledByTheOwner
};

const testActions = {
  syncOffer,
  setOfferEpic,
  loadBuyOffersEpic,
  loadSellOffersEpic,
};

const reducer = handleActions({
  [initOffers]: (state, { payload }) => {
    return state.updateIn(['offers'], () => payload).set('offersInitialized', () => true);
  },
  [syncOffers.pending]: (state, { payload }) =>
    state.updateIn(['offers', Map(payload), 'initialSyncStatus'], () => SYNC_STATUS_PENDING),
  [syncOffers.fulfilled]: (state, { payload }) =>
    state.updateIn(['offers', Map(payload), 'initialSyncStatus'], () => SYNC_STATUS_COMPLETED),
  [syncOffers.rejected]: (state, { payload }) =>
    state.updateIn(['offers', Map(payload), 'initialSyncStatus'], () => SYNC_STATUS_ERROR),
  [fulfilled(getTradingPairOfferCount)]:
    (state, { payload: { baseToken, quoteToken, buyOfferCount, sellOfferCount } }) => {
      // console.log('getTradingPairOfferCount', baseToken, quoteToken);
      return state.updateIn(
        ['offers', Map({ baseToken, quoteToken })],
        tradingPairOffers => {
          return tradingPairOffers
            .updateIn(['buyOfferCount'], () => buyOfferCount)
            .updateIn(['sellOfferCount'], () => sellOfferCount);
        },
      );
    },
  [pending(loadOffer)]: state => state,
  [fulfilled(loadOffer)]: state => state,
  [setOffer]: (state, { payload: { offer, baseToken, quoteToken, offerType } }) => {
    return state.updateIn(
      ['offers', Map({ baseToken, quoteToken })], tradingPairOffers => {
        switch (offerType) {
          case TYPE_BUY_OFFER :
            return tradingPairOffers.updateIn(['buyOffers'], buyOffers => buyOffers.push(offer));
          case TYPE_SELL_OFFER:
            return tradingPairOffers.updateIn(['sellOffers'], sellOffers => sellOffers.push(offer));
          default: {
            console.log(
              'this should never happen !!!', { offer, baseToken, quoteToken, offerType },
            );
            return tradingPairOffers;
          }
        }
      },
    );
  },
  [updateOffer]: (state, { payload: { offer, baseToken, quoteToken, offerType } }) =>
    state.updateIn(
      ['offers', Map({ baseToken, quoteToken })], tradingPairOffers => {
        switch (offerType) {
          case TYPE_BUY_OFFER :
            return tradingPairOffers.updateIn(['buyOffers'], buyOffers =>
              buyOffers.update(buyOffers.findIndex(
                buyOffer => buyOffer.id == offer.id), () => offer,
              ),
            );
          case TYPE_SELL_OFFER:
            return tradingPairOffers.updateIn(['sellOffers'], sellOffers =>
              sellOffers.update(sellOffers.findIndex(
                sellOffer => sellOffer.id == offer.id), () => offer,
              ),
            );
        }
      },
    ),
  // [pending(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_PENDING),
  // [fulfilled(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_COMPLETED),
  // [rejected(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_ERROR),

  [loadBuyOffers.pending]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_PENDING),
  [loadBuyOffers.fulfilled]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_COMPLETED),
  [loadBuyOffers.rejected]: (state, { payload }) =>
    // state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_ERROR),
    { throw payload },

  [loadSellOffers.pending]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_PENDING),
  [loadSellOffers.fulfilled]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_COMPLETED),
  [loadSellOffers.rejected]: (state, { payload }) =>
    // state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_ERROR),
    { throw payload },

  [offerCancelledEvent]: (state, { payload: { tradingPair, offerType, offerId } }) => {
    switch (offerType) {
      case TYPE_BUY_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'buyOffers'],
            buyOfferList => buyOfferList.filter(offer => offer.id !== offerId),
          );
      case TYPE_SELL_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'sellOffers'],
            sellOfferList => sellOfferList.filter(offer => offer.id !== offerId),
          );

    }
  },
  // [offerPartiallyFilledIn]:
  //   (state, { payload: { offerId, tradingPair, offerType, updatedOffer, previousOfferState } }) => state,
  [offerCompletelyFilledIn]:
    (state, { payload: { offerId, tradingPair, offerType } }) => {
      switch (offerType) {
        case TYPE_BUY_OFFER:
          return state
            .updateIn(['offers', Map(tradingPair), 'buyOffers'],
              buyOfferList => buyOfferList.filter(offer => offer.id !== offerId),
            );
        case TYPE_SELL_OFFER:
          return state
            .updateIn(['offers', Map(tradingPair), 'sellOffers'],
              sellOfferList => sellOfferList.filter(offer => offer.id !== offerId),
            );

      }
    },
  [setActiveTradingPairBestOfferIds]:
    (state, {payload: { bestBuyOfferId, bestSellOfferId }}) =>
      state
        .setIn(['activeTradingPairBestOfferId', 'bestBuyOfferId'], bestBuyOfferId)
        .setIn(['activeTradingPairBestOfferId', 'bestSellOfferId'], bestSellOfferId),
  [removeOrderCancelledByTheOwner]: (state, { payload: { tradingPair, offerType, offerId } }) => {
    switch (offerType) {
      case TYPE_BUY_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'buyOffers'],
            buyOfferList => buyOfferList.filter(offer => offer.id !== offerId),
          );
      case TYPE_SELL_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'sellOffers'],
            sellOfferList => sellOfferList.filter(offer => offer.id !== offerId),
          );

    }
  },
  [removeOfferFromTheOrderBook]: (state, { payload: { tradingPair, offerType, offerId } }) => {
    switch (offerType) {
      case TYPE_BUY_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'buyOffers'],
            buyOfferList => buyOfferList.filter(offer => offer.id !== offerId),
          );
      case TYPE_SELL_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'sellOffers'],
            sellOfferList => sellOfferList.filter(offer => offer.id !== offerId),
          );

    }
  },
  [markOfferAsInactive]: (state, { payload: { offerId, offer, tradingPair, offerType } }) =>
    state.updateIn(
      ['offers', Map(tradingPair)], tradingPairOffers => {
        switch (offerType) {
          case TYPE_BUY_OFFER :
            return tradingPairOffers.updateIn(['buyOffers'], buyOffers =>
              buyOffers.update(buyOffers.findIndex(
                buyOffer => buyOffer.id === offerId), (offerToUpdate) => {
                  return { ...offerToUpdate, status: OFFER_STATUS_INACTIVE };
                },
              ),
            );
          case TYPE_SELL_OFFER:
            return tradingPairOffers.updateIn(['sellOffers'], sellOffers =>
              sellOffers.update(sellOffers.findIndex(
                sellOffer => sellOffer.id === offerId), (offerToUpdate) =>  {
                  return { ...offerToUpdate, status: OFFER_STATUS_INACTIVE };
                },
              ),
            );
        }
      },
    ),
}, initialState);

export default {
  actions,
  testActions,
  reducer,
};
