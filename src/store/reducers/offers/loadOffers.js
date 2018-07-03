/* eslint-disable no-unused-vars */
import { createPromiseActions } from "../../../utils/createPromiseActions";
import { syncOffer, syncRawOffer } from './syncOfferEpic';
import { getBestOffer } from "./syncOffersEpic";
import { Map } from "immutable";
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_PENDING } from "../../../constants";
import {
  getMarketContractInstance,
  getOTCSupportMethodsContractInstance,
  getTokenContractInstance,
} from '../../../bootstrap/contracts';

export const loadSellOffers = createPromiseActions("OFFERS/LOAD_SELL_OFFERS");
export const loadSellOffersEpic = (
  offerCount,
  sellToken,
  buyToken,
  {
    doGetOffers = getOTCSupportMethodsContractInstance().getOffers,
    doSyncRawOffer = syncRawOffer,
  } = {}
) => async dispatch => {
  try {
    const sellOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
    dispatch(loadSellOffers.pending(sellOffersTradingPair));
    doGetOffers(
      getMarketContractInstance().address,
      getTokenContractInstance(sellToken).address,
      getTokenContractInstance(buyToken).address,
    ).then(
      res => {
        for (let i =0; i < 500; i+=5) {
          const [
            offerId,
            sellHowMuch,
            buyHowMuch,
            owner,
            timestamp
          ] = res.slice(i, i+5);
          if (parseInt(offerId, 16)> 0 ) {
            dispatch(doSyncRawOffer({
              offerId,
              sellHowMuch,
              sellWhichTokenAddress: getTokenContractInstance(sellToken).address,
              buyHowMuch,
              buyWhichTokenAddress: getTokenContractInstance(buyToken).address,
              owner,
              timestamp
            }))
          }
        }
        dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
      }
    );
    return loadSellOffers;
  } catch (e) {
    dispatch(loadSellOffers.rejected(e));
  }
};

export const loadBuyOffers = createPromiseActions("OFFERS/LOAD_BUY_OFFERS");
export const loadBuyOffersEpic = (
  offerCount,
  buyToken,
  sellToken,
  {
    doGetOffers = getOTCSupportMethodsContractInstance().getOffers,
    doSyncRawOffer = syncRawOffer,
  } = {}
) => async dispatch => {
  try {
    const buyOffersTradingPair = { baseToken: buyToken, quoteToken: sellToken };
    dispatch(loadBuyOffers.pending(buyOffersTradingPair));
    doGetOffers(
      getMarketContractInstance().address,
      getTokenContractInstance(sellToken).address,
      getTokenContractInstance(buyToken).address,
    ).then(
      res => {
        for (let i =0; i < 500; i+=5) {
          const [
            offerId,
            sellHowMuch,
            buyHowMuch,
            owner,
            timestamp
          ] = res.slice(i, i+5);
          if (parseInt(offerId, 16) > 0 ) {
            dispatch(doSyncRawOffer({
              offerId,
              sellHowMuch,
              sellWhichTokenAddress: getTokenContractInstance(sellToken).address,
              buyHowMuch,
              buyWhichTokenAddress: getTokenContractInstance(buyToken).address,
              owner,
              timestamp
            }))
          }
        }
        dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair));
      }
    );
    return loadBuyOffers;
  } catch (e) {
    dispatch(loadBuyOffers.rejected(e));
  }
};

export const reducer = {
  [loadBuyOffers.pending]: (state, { payload }) =>
    state.setIn(
      ["offers", Map(payload), "loadingBuyOffers"],
      SYNC_STATUS_PENDING
    ),
  [loadBuyOffers.fulfilled]: (state, { payload }) =>
    state.setIn(
      ["offers", Map(payload), "loadingBuyOffers"],
      SYNC_STATUS_COMPLETED
    ),
  [loadBuyOffers.rejected]: (state, { payload }) =>
    // state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_ERROR),
    {
      throw payload;
    },

  [loadSellOffers.pending]: (state, { payload }) =>
    state.setIn(
      ["offers", Map(payload), "loadingSellOffers"],
      SYNC_STATUS_PENDING
    ),
  [loadSellOffers.fulfilled]: (state, { payload }) =>
    state.setIn(
      ["offers", Map(payload), "loadingSellOffers"],
      SYNC_STATUS_COMPLETED
    ),
  [loadSellOffers.rejected]: (state, { payload }) =>
    // state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_ERROR),
    {
      throw payload;
    }
};
