import {getTradingPairOfferCount} from './getTradingPairOffersCount';
import {createPromiseActions} from '../../../utils/createPromiseActions';
import {getMarketContractInstance} from '../../../bootstrap/contracts';
import findOffer from '../../../utils/offers/findOffer';
import {createAction} from 'redux-actions';

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
export const subscribeCancelledOrdersEpic = (fromBlock, filter = {}) => async (dispatch, getState) => {
  dispatch(subscribeCancelledOrders.pending());
  try {
    getMarketContractInstance().LogKill(filter, { fromBlock, toBlock: 'latest' }).then(
      (err, LogKillEvent) => {
        const {
          id,
          maker,
          timestamp
        } = LogKillEvent.args;

        console.log('LogKillEvent', id, LogKillEvent);
        const { tradingPair , offerType } = findOffer(id, getState());
        if(tradingPair.baseToken && tradingPair.quoteToken) {
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
            getTradingPairOfferCount(tradingPair.baseToken, tradingPair.quoteToken),
          );
        }
      },
    );
  } catch (e) {
    dispatch(subscribeCancelledOrders.rejected(e));
  }
  dispatch(subscribeCancelledOrders.fulfilled());
};
