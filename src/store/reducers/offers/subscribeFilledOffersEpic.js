import {OFFER_SYNC_TYPE_NEW_OFFER, OFFER_SYNC_TYPE_UPDATE} from '../offers';
import findOffer from '../../../utils/offers/findOffer';
import {syncOffer} from './syncOfferEpic';
import offerTakes from '../../selectors/offerTakes';
import {createPromiseActions} from '../../../utils/createPromiseActions';
import {getMarketContractInstance} from '../../../bootstrap/contracts';
import {createAction} from 'redux-actions';


export const removeOfferFromTheOrderBook = createAction(
  'OFFERS/REMOVE_OFFER_FROM_THE_ORDER_BOOK',
  ({ offerId, tradingPair, offerType }) =>  ({ offerId, tradingPair, offerType })
);
export const markOfferAsInactive = createAction(
  'OFFERS/MARK_OFFER_AS_INACTIVE',
  ({ offerId, tradingPair, offerType }) =>  ({ offerId, tradingPair, offerType })
);

export const checkOfferIsActive = createAction(
  'OFFERS/CHECK_OFFER_IS_ACTIVE',
  offerId => getMarketContractInstance().isActive(offerId),
);


export const subscribeFilledOrders = createPromiseActions(
  'OFFERS/SUBSCRIBE_FILLED_OFFERS',
);
export const subscribeFilledOffersEpic = (fromBlock, filter = {}) => async (dispatch, getState) => {
  dispatch(subscribeFilledOrders.pending());
  getMarketContractInstance().LogItemUpdate(filter, { fromBlock, toBlock: 'latest' }).then(
    async (err, LogItemUpdateEvent) => {
      const offerId = LogItemUpdateEvent.args.id.toNumber();
      const isOfferActive = (await dispatch(checkOfferIsActive(offerId))).value;
      if (offerId && isOfferActive) {

        /**
         * Check if offer is already in the store:
         * - yes -> update offer
         * - no -> insert into the offer list
         */
        const offerSearchResult = findOffer(offerId, getState());
        if (offerSearchResult) {
          // console.log('LogItemUpdate', offerId, LogItemUpdateEvent, OFFER_SYNC_TYPE_UPDATE);
          dispatch(syncOffer(offerId, OFFER_SYNC_TYPE_UPDATE, offerSearchResult.offer));
        } else {
          // console.log('LogItemUpdate', offerId, LogItemUpdateEvent, OFFER_SYNC_TYPE_NEW_OFFER);
          dispatch(syncOffer(offerId, OFFER_SYNC_TYPE_NEW_OFFER));
        }
      } // else offer is being cancelled ( handled in LogKill )
      else {
        const offerInOrderBook = findOffer(offerId, getState());
        if (offerInOrderBook) {
          if (offerTakes.activeOfferTakeOfferId(getState()) === offerId.toString()) {
            dispatch(markOfferAsInactive(offerInOrderBook));
          } else {
            dispatch(removeOfferFromTheOrderBook(offerInOrderBook));
          }
        }
      }
    },
    err => subscribeFilledOrders.rejected(err),
  );
  dispatch(subscribeFilledOrders.fulfilled());
};
