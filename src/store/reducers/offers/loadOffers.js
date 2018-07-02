/* eslint-disable no-unused-vars */
import { createPromiseActions } from "../../../utils/createPromiseActions";
import { syncOffer, syncRawOffer } from "./syncOfferEpic";
import { getBestOffer } from "./syncOffersEpic";
import { Map } from "immutable";
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_PENDING } from "../../../constants";
import {
  getMarketContractInstance,
  getOTCSupportMethodsContractInstance,
  getTokenContractInstance
} from "../../../bootstrap/contracts";

const OFFER_SIZE = 5;
const PAGE_SIZE = 100;

export const loadSellOffers = createPromiseActions("OFFERS/LOAD_SELL_OFFERS");

const parsePayload = async (payload, { dispatch, sellToken, buyToken }) => {
  let latestSellOfferId = null;
  for (let i = 0; i < PAGE_SIZE * OFFER_SIZE; i += OFFER_SIZE) {
    const [offerId, sellHowMuch, buyHowMuch, owner, timestamp] = payload.slice(
      i,
      i + OFFER_SIZE
    );
    if (parseInt(offerId, 16) > 0) {
      dispatch(
        syncRawOffer({
          offerId,
          sellHowMuch,
          sellWhichTokenAddress: getTokenContractInstance(sellToken).address,
          buyHowMuch,
          buyWhichTokenAddress: getTokenContractInstance(buyToken).address,
          owner,
          timestamp
        })
      );
    }
    latestSellOfferId = offerId;
  }
  return latestSellOfferId;
};

export const loadSellOffersEpic = (
  offersLoadMeta,
  sellToken,
  buyToken,
  {
    doSyncOffer = syncOffer,
    doGetOTCSupportMethodsContractInstance = getOTCSupportMethodsContractInstance,
    doGetMarketContractInstance = getMarketContractInstance,
    doGetTokenContractInstance = getTokenContractInstance
  } = {}
) => async dispatch => {
  try {
    const sellOffersTradingPair = {
      baseToken: sellToken,
      quoteToken: buyToken
    };
    dispatch(loadSellOffers.pending(sellOffersTradingPair));
    const rawOffersPayload = await doGetOTCSupportMethodsContractInstance().getOffers(
      doGetMarketContractInstance().address,
      doGetTokenContractInstance(sellToken).address,
      doGetTokenContractInstance(buyToken).address
    );
    let lastSellOfferId = await parsePayload(rawOffersPayload, {
      dispatch,
      sellToken,
      buyToken
    });

    if (parseInt(lastSellOfferId, 16) !== 0) {
      while (lastSellOfferId) {
        lastSellOfferId = parsePayload(
          await doGetOTCSupportMethodsContractInstance().getOffers(
            doGetMarketContractInstance().address,
            lastSellOfferId
          ),
          {
            dispatch,
            sellToken,
            buyToken
          }
        );
      }
    } else {
      dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
    }
    return loadSellOffers;
  } catch (e) {
    dispatch(loadSellOffers.rejected(e));
  }
};

export const loadBuyOffers = createPromiseActions("OFFERS/LOAD_BUY_OFFERS");
export const loadBuyOffersEpic = (
  offersLoadMeta,
  buyToken,
  sellToken,
  {
    doGetOTCSupportMethodsContractInstance = getOTCSupportMethodsContractInstance,
    doGetMarketContractInstance = getMarketContractInstance,
    doGetTokenContractInstance = getTokenContractInstance
  } = {}
) => async dispatch => {
  try {
    const buyOffersTradingPair = { baseToken: buyToken, quoteToken: sellToken };
    dispatch(loadBuyOffers.pending(buyOffersTradingPair));
    const rawOffersPayload = await doGetOTCSupportMethodsContractInstance().getOffers(
      doGetMarketContractInstance().address,
      doGetTokenContractInstance(sellToken).address,
      doGetTokenContractInstance(buyToken).address
    );
    let lastBuyOfferId = await parsePayload(rawOffersPayload, {
      dispatch,
      sellToken,
      buyToken
    });
    if (parseInt(lastBuyOfferId, 16) !== 0) {
      while (lastBuyOfferId) {
        lastBuyOfferId = await parsePayload(
          await doGetOTCSupportMethodsContractInstance().getOffers(
            doGetMarketContractInstance().address,
            lastBuyOfferId
          ),
          {
            dispatch,
            sellToken,
            buyToken
          }
        );
      }
    } else {
      dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair));
    }
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
