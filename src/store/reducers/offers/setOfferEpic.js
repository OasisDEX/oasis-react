import {
  OFFER_SYNC_TYPE_INITIAL,
  OFFER_SYNC_TYPE_NEW_OFFER,
  OFFER_SYNC_TYPE_UPDATE
} from "../offers";
import { convertTo18Precision } from "../../../utils/conversion";
import findOffer from "../../../utils/offers/findOffer";
import getTokenByAddress from "../../../utils/tokens/getTokenByAddress";
import tokens from "../../selectors/tokens";
import { createAction } from "redux-actions";
import BigNumber from "bignumber.js";
import { Map } from "immutable";
import { TYPE_BUY_OFFER, TYPE_SELL_OFFER } from "../offers";

export const setOffer = createAction(
  "OFFERS/SET_OFFER",
  ({ offer, baseToken, quoteToken, offerType }) => ({
    offer,
    baseToken,
    quoteToken,
    offerType
  })
);

export const offerPartiallyFilledIn = createAction(
  "OFFERS/OFFER_PARTIALLY_FILLED_IN",
  ({
    offerId,
    baseToken,
    quoteToken,
    offerType,
    updatedOffer,
    previousOfferState
  }) => ({
    offerId,
    baseToken,
    quoteToken,
    offerType,
    updatedOffer,
    previousOfferState
  })
);
export const offerCompletelyFilledIn = createAction(
  "OFFERS/OFFER_COMPLETELY_FILLED_IN",
  ({
    offerId,
    baseToken,
    quoteToken,
    offerType,
    updatedOffer,
    previousOfferState
  }) => ({
    offerId,
    baseToken,
    quoteToken,
    offerType,
    updatedOffer,
    previousOfferState
  })
);

export const updateOffer = createAction(
  "OFFERS/UPDATE_OFFER",
  ({ offer, baseToken, quoteToken, offerType, previousOfferState }) => ({
    offer,
    baseToken,
    quoteToken,
    offerType,
    previousOfferState
  })
);

export const setOfferEpic = ({
  id = null,
  sellHowMuch,
  sellWhichTokenAddress,
  buyHowMuch,
  buyWhichTokenAddress,
  owner,
  status,
  offerType,
  syncType = OFFER_SYNC_TYPE_INITIAL,
  tradingPair: { baseToken, quoteToken },
  previousOfferState
}) => async (dispatch, getState) => {
  const sellToken = getTokenByAddress(sellWhichTokenAddress);
  const buyToken = getTokenByAddress(buyWhichTokenAddress);

  /**
   * We ignore pairs that we cant find contract for.
   */
  if (!sellToken || !buyToken) {
    return;
  }

  const precision = tokens.precision(getState());

  let sellHowMuchValue = convertTo18Precision(sellHowMuch, sellToken);
  let buyHowMuchValue = convertTo18Precision(buyHowMuch, buyToken);
  if (!(sellHowMuchValue instanceof BigNumber)) {
    sellHowMuchValue = new BigNumber(sellHowMuchValue, 10);
  }
  if (!(buyHowMuchValue instanceof BigNumber)) {
    buyHowMuchValue = new BigNumber(buyHowMuchValue, 10);
  }

  const offer = {
    id,
    owner,
    status,
    buyWhichTokenAddress,
    buyWhichToken: buyToken,
    sellWhichTokenAddress,
    sellWhichToken: sellToken,
    buyHowMuch: buyHowMuchValue.valueOf(),
    sellHowMuch: sellHowMuchValue.valueOf(),
    buyHowMuch_filter: buyHowMuchValue.toNumber(),
    sellHowMuch_filter: sellHowMuchValue.toNumber(),
    ask_price: buyHowMuchValue.div(sellHowMuchValue).valueOf(),
    bid_price: sellHowMuchValue.div(buyHowMuchValue).valueOf(),
    ask_price_sort: new BigNumber(
      buyHowMuchValue
        .div(sellHowMuchValue)
        .toFixed(precision < 5 ? 5 : precision, 6),
      10
    ).toNumber(),
    bid_price_sort: new BigNumber(
      sellHowMuchValue
        .div(buyHowMuchValue)
        .toFixed(precision < 5 ? 5 : precision, 6),
      10
    ).toNumber()
  };

  switch (syncType) {
    case OFFER_SYNC_TYPE_NEW_OFFER:
      dispatch(setOffer({ offer, baseToken, quoteToken, offerType }));
      break;
    case OFFER_SYNC_TYPE_INITIAL:
      /**
       * Check if offer wasn't pushed via LogItemUpdate event:
       *  - yes => update existing offer.
       *  - no => push new offer to the list.
       */
      if (findOffer(id, getState())) {
        dispatch(updateOffer({ offer, baseToken, quoteToken, offerType }));
      } else {
        dispatch(setOffer({ offer, baseToken, quoteToken, offerType }));
      }
      break;
    case OFFER_SYNC_TYPE_UPDATE:
      if (sellHowMuchValue.eq(0) || buyHowMuchValue.eq(0)) {
        console.log("COMPLETE FILLED_IN", {
          sellHowMuch,
          sellWhichTokenAddress,
          buyHowMuch,
          buyWhichTokenAddress,
          owner,
          status,
          offerType,
          tradingPair: { baseToken, quoteToken },
          previousOfferState
        });
        dispatch(
          offerCompletelyFilledIn({
            baseToken,
            quoteToken,
            offerType,
            offerId: id,
            updatedOffer: offer,
            previousOfferState
          })
        );
      } else {
        dispatch(updateOffer({ offer, baseToken, quoteToken, offerType }));
        dispatch(
          offerPartiallyFilledIn({
            baseToken,
            quoteToken,
            offerType,
            offerId: id,
            updatedOffer: offer,
            previousOfferState
          })
        );
      }
      break;
  }
};

export const reducer = {
  [setOffer]: (
    state,
    { payload: { offer, baseToken, quoteToken, offerType } }
  ) => {
    return state.updateIn(
      ["offers", Map({ baseToken, quoteToken })],
      tradingPairOffers => {
        switch (offerType) {
          case TYPE_BUY_OFFER:
            return tradingPairOffers.updateIn(["buyOffers"], buyOffers =>
              buyOffers.push(offer)
            );
          case TYPE_SELL_OFFER:
            return tradingPairOffers.updateIn(["sellOffers"], sellOffers =>
              sellOffers.push(offer)
            );
          default: { return tradingPairOffers; }
        }
      }
    );
  },
  [updateOffer]: (
    state,
    { payload: { offer, baseToken, quoteToken, offerType } }
  ) =>
    state.updateIn(
      ["offers", Map({ baseToken, quoteToken })],
      tradingPairOffers => {
        switch (offerType) {
          case TYPE_BUY_OFFER:
            return tradingPairOffers.updateIn(["buyOffers"], buyOffers =>
              buyOffers.update(
                buyOffers.findIndex(buyOffer => buyOffer.id == offer.id),
                () => offer
              )
            );
          case TYPE_SELL_OFFER:
            return tradingPairOffers.updateIn(["sellOffers"], sellOffers =>
              sellOffers.update(
                sellOffers.findIndex(sellOffer => sellOffer.id == offer.id),
                () => offer
              )
            );
        }
      }
    ),
  // [offerPartiallyFilledIn]:
  //   (state, { payload: { offerId, tradingPair, offerType, updatedOffer, previousOfferState } }) => state,
  [offerCompletelyFilledIn]: (
    state,
    { payload: { offerId, tradingPair, offerType } }
  ) => {
    switch (offerType) {
      case TYPE_BUY_OFFER:
        return state.updateIn(
          ["offers", Map(tradingPair), "buyOffers"],
          buyOfferList => buyOfferList.filter(offer => offer.id !== offerId)
        );
      case TYPE_SELL_OFFER:
        return state.updateIn(
          ["offers", Map(tradingPair), "sellOffers"],
          sellOfferList => sellOfferList.filter(offer => offer.id !== offerId)
        );
    }
  }
};
