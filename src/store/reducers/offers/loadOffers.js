import { createPromiseActions } from "../../../utils/createPromiseActions";
import { syncRawOffer } from "./syncOfferEpic";
import { Map } from "immutable";
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_PENDING } from "../../../constants";
import {
  getMarketContractInstance,
  getOTCSupportMethodsContractInstance,
  getOTCSupportMethodsNoProxyContractInstance,
  getTokenContractInstance
} from "../../../bootstrap/contracts";
import promisify from "../../../utils/promisify";

const PAGE_SIZE = 100;

const OFFER_ID_IDX = 0;
const SELL_AMOUNT_IDX = 1;
const BUY_AMOUNT_IDX = 2;
const OFFER_OWNER_IDX = 3;
const TIMESTAMP_IDX = 4;

const parsePayload = (payload, pageIdx, { sellToken, buyToken }) => {
  const [offerId, sellHowMuch, buyHowMuch, owner, timestamp] = [
    payload[OFFER_ID_IDX][pageIdx],
    payload[SELL_AMOUNT_IDX][pageIdx],
    payload[BUY_AMOUNT_IDX][pageIdx],
    payload[OFFER_OWNER_IDX][pageIdx],
    payload[TIMESTAMP_IDX][pageIdx]
  ];
  if (offerId.gt(0)) {
    return {
      offerId,
      sellHowMuch,
      sellWhichTokenAddress: getTokenContractInstance(sellToken).address,
      buyHowMuch,
      buyWhichTokenAddress: getTokenContractInstance(buyToken).address,
      owner,
      timestamp
    };
  } else {
    return null;
  }
};

const parseAndSyncOffersPage = (
  rawOffersPayload,
  { dispatch, sellToken, buyToken }
) => {
  let backtrackOfferId = null;
  let currentParsedOffer = null;
  for (let pageIdx = 0; pageIdx < PAGE_SIZE; ++pageIdx) {
    if (pageIdx) {
      backtrackOfferId = currentParsedOffer.offerId;
    }
    currentParsedOffer = parsePayload(rawOffersPayload, pageIdx, {
      sellToken,
      buyToken
    });
    if (currentParsedOffer) {
      dispatch(syncRawOffer(currentParsedOffer));
      if (pageIdx === PAGE_SIZE - 1) {
        return {
          lastOfferId: currentParsedOffer.offerId,
          backtrackOfferId: backtrackOfferId,
          hasFullPage: true
        };
      }
    } else {
      return {
        lastOfferId: null,
        backtrackOfferId: backtrackOfferId,
        shouldBacktrack: pageIdx === 0
      };
    }
  }
};

export const loadSellOffers = createPromiseActions("OFFERS/LOAD_SELL_OFFERS");
export const loadSellOffersEpic = (
  offersLoadMeta,
  sellToken,
  buyToken
) => async dispatch => {
  try {
    const OTCMarketAddress = getMarketContractInstance().address;
    const sellOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
    dispatch(loadSellOffers.pending(sellOffersTradingPair));
    const rawOffersPayload = await getOTCSupportMethodsContractInstance().getOffers(
      OTCMarketAddress,
      getTokenContractInstance(sellToken).address,
      getTokenContractInstance(buyToken).address
    );
    const firstPageParseResult = parseAndSyncOffersPage(rawOffersPayload, {
      dispatch,
      sellToken,
      buyToken
    });
    if (
      firstPageParseResult.lastOfferId &&
      firstPageParseResult.lastOfferId.gt(0)
    ) {
      let {
        lastOfferId: lastSellOfferId,
        backtrackOfferId: firstPageBacktrackOfferId
      } = firstPageParseResult;
      while (lastSellOfferId) {
        const eachNextPageParseResult = parseAndSyncOffersPage(
          await promisify(
            getOTCSupportMethodsNoProxyContractInstance()
              .getOffers["address,uint256"])(OTCMarketAddress, lastSellOfferId.toString()),
          { dispatch, sellToken, buyToken }
        );
        lastSellOfferId = !eachNextPageParseResult.shouldBacktrack
          ? eachNextPageParseResult.lastOfferId
          : (lastSellOfferId !== firstPageParseResult.lastOfferId ? firstPageBacktrackOfferId : undefined);
      }
      if (lastSellOfferId === undefined) {
        dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
        return dispatch(loadSellOffersEpic(offersLoadMeta, sellToken, buyToken));
      }
    }
    dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
    return loadSellOffers;
  } catch (e) {
    dispatch(loadSellOffers.rejected(e));
  }
};

export const loadBuyOffers = createPromiseActions("OFFERS/LOAD_BUY_OFFERS");
export const loadBuyOffersEpic = (
  offersLoadMeta,
  buyToken,
  sellToken
) => async dispatch => {
  try {
    const OTCMarketAddress = getMarketContractInstance().address;
    const buyOffersTradingPair = { baseToken: buyToken, quoteToken: sellToken };
    dispatch(loadBuyOffers.pending(buyOffersTradingPair));
    const rawOffersPayload = await getOTCSupportMethodsContractInstance().getOffers(
      OTCMarketAddress,
      getTokenContractInstance(sellToken).address,
      getTokenContractInstance(buyToken).address
    );
    const firstPageParseResult = parseAndSyncOffersPage(rawOffersPayload, {
      dispatch,
      sellToken,
      buyToken
    });
    if (
      firstPageParseResult.lastOfferId &&
      firstPageParseResult.lastOfferId.gt(0)
    ) {
      let {
        lastOfferId: lastBuyOfferId,
        backtrackOfferId: firstPageBacktrackOfferId
      } = firstPageParseResult;
      while (lastBuyOfferId) {
        const eachNextPageParseResult = parseAndSyncOffersPage(
          await promisify(
            getOTCSupportMethodsNoProxyContractInstance()
              .getOffers["address,uint256"])(OTCMarketAddress, lastBuyOfferId.toString()),
          { dispatch, sellToken, buyToken }
        );
        lastBuyOfferId = !eachNextPageParseResult.shouldBacktrack
          ? eachNextPageParseResult.lastOfferId
          : (lastBuyOfferId !== firstPageParseResult.lastOfferId ? firstPageBacktrackOfferId : undefined);
      }
      if (lastBuyOfferId === undefined) {
        dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair));
        return dispatch(loadBuyOffersEpic(offersLoadMeta, buyToken, sellToken));
      }
    }
    dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair));
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
