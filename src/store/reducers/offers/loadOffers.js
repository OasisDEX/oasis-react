import { createPromiseActions } from "../../../utils/createPromiseActions";
import { syncOffer } from "./syncOfferEpic";
import { getBestOffer } from "./syncOffersEpic";
import { Map } from "immutable";
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_PENDING } from "../../../constants";
import {
  getMarketContractInstance,
  getOTCSupportMethodsContractInstance,
  getTokenContractInstance,
} from '../../../bootstrap/contracts';
import offersReducer from './index';

export const loadSellOffers = createPromiseActions("OFFERS/LOAD_SELL_OFFERS");
export const loadSellOffersEpic = (
  offerCount,
  sellToken,
  buyToken,
  {
    // eslint-disable-next-line no-unused-vars
    doGetBestOffer = getBestOffer,
    doSyncOffer = syncOffer,
  } = {}
) => async dispatch => {
  dispatch(offersReducer.actions.getBestOfferIdsForActiveTradingPairEpic());
  try {
    const sellOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
    const sellOffersLoadPromisesList = [];
    getOTCSupportMethodsContractInstance().getOffers(
      getMarketContractInstance().address,
      getTokenContractInstance(sellToken).address,
      getTokenContractInstance(buyToken).address,
    ).then(
      res => res.filter(offerId => offerId.gt(0) ? offerId: null).forEach(
        offerId => dispatch(doSyncOffer(offerId.toString()))
      )
    );
    dispatch(loadSellOffers.pending(sellOffersTradingPair));
    Promise.all(sellOffersLoadPromisesList).then(
      () => dispatch(loadSellOffers.fulfilled(sellOffersTradingPair))
    );

    dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
    return loadSellOffers;
  } catch (e) {
    dispatch(loadSellOffers.rejected(e));
  }
};

export const loadBuyOffers = createPromiseActions("OFFERS/LOAD_BUY_OFFERS");
export const loadBuyOffersEpic = (
  offerCount,
  sellToken,
  buyToken,
  {
// eslint-disable-next-line no-unused-vars
    doGetBestOffer = getBestOffer,
    doSyncOffer = syncOffer,
  } = {}
) => async dispatch => {
  try {
    const buyOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
    dispatch(loadBuyOffers.pending(buyOffersTradingPair));
    const buyOffersLoadPromisesList = [];
    getOTCSupportMethodsContractInstance().getOffers(
      getMarketContractInstance().address,
      getTokenContractInstance(buyToken).address,
      getTokenContractInstance(sellToken).address
    ).then(
      res => res.filter(offerId => offerId.gt(0) ? offerId : null).forEach(offerId => {
        buyOffersLoadPromisesList.push(dispatch(doSyncOffer(offerId.toString())))
      })
    );

    Promise.all(buyOffersLoadPromisesList).then(
      () => dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair))
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
