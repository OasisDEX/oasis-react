import {getTradingPairOfferCount} from './getTradingPairOffersCount';
import {createPromiseActions} from '../../../utils/createPromiseActions';
import {getMarketContractInstance} from '../../../bootstrap/contracts';
import findOffer from '../../../utils/offers/findOffer';
import {createAction} from 'redux-actions';
import {TYPE_BUY_OFFER, TYPE_SELL_OFFER} from '../offers';
import {Map} from 'immutable';
import { OFFER_STATUS_INACTIVE } from './index';

export const removeOrderCancelledByTheOwner = createAction(
  'OFFER/REMOVE_OFFER_CANCELLED_BY_THE_OWNER',
  ({ offerType, offerId, tradingPair }) => ({ offerType, offerId, tradingPair })
);
export const offerCancelledEvent = createAction(
  'OFFERS/EVENT___OFFER_CANCELLED', data => data,
);
const subscribeCancelledOrders = createPromiseActions(
  'OFFERS/SUBSCRIBE_CANCELLED_OFFERS',
);
export const subscribeCancelledOrdersEpic = (fromBlock, filter = {}, {
  doGetMarketContractInstance = getMarketContractInstance,
  doGetTradingPairOfferCount = getTradingPairOfferCount,
} = {}) => async (dispatch, getState) => {
  dispatch(subscribeCancelledOrders.pending());
  try {
    doGetMarketContractInstance().LogKill(filter, { fromBlock, toBlock: 'latest' }).then(
      (err, LogKillEvent) => {
        const {
          id,
          maker,
          timestamp
        } = LogKillEvent.args;

        console.log('LogKillEvent', id, LogKillEvent);
        const offerInfo = findOffer(id, getState());
        if(offerInfo) {
          const { tradingPair , offerType } = offerInfo;
          dispatch(
            offerCancelledEvent(
              {
                maker,
                offerType,
                offerId: parseInt(id, 16).toString(),
                tradingPair,
                timestamp
              },
            ),
          );
          dispatch(
            doGetTradingPairOfferCount(tradingPair.baseToken, tradingPair.quoteToken),
          );
        }
      },
    );
  } catch (e) {
    dispatch(subscribeCancelledOrders.rejected(e));
  }
  dispatch(subscribeCancelledOrders.fulfilled());
};

export const reducer = {
  [offerCancelledEvent]: (state, { payload: { offerId, tradingPair, offerType } }) =>
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
  [removeOrderCancelledByTheOwner]: (state, { payload: { offerId, tradingPair, offerType } }) =>
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
};
