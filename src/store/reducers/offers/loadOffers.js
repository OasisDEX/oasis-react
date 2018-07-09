import { createPromiseActions } from "../../../utils/createPromiseActions";
import { syncRawOffer } from "./syncOfferEpic";
import { resetBuyOffers, resetSellOffers } from "./syncOffersEpic";
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
  { dispatch, sellToken, buyToken },
  {
    pageSize = PAGE_SIZE,
  } = {}
) => {
  let backtrackOfferId = null;
  let currentParsedOffer = null;
  for (let pageIdx = 0; pageIdx < pageSize; ++pageIdx) {
    if (pageIdx) {
      backtrackOfferId = currentParsedOffer.offerId;
    }
    currentParsedOffer = parsePayload(rawOffersPayload, pageIdx, {
      sellToken,
      buyToken
    });
    if (currentParsedOffer) {
      dispatch(syncRawOffer(currentParsedOffer));
      if (pageIdx === pageSize - 1) {
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
  buyToken, {
    firstPage = (sellToken, buyToken) => getOTCSupportMethodsContractInstance().getOffers(
      getMarketContractInstance().address,
      getTokenContractInstance(sellToken).address,
      getTokenContractInstance(buyToken).address
    ),
    nextPage = (lastSellOfferId) => promisify(getOTCSupportMethodsNoProxyContractInstance().getOffers["address,uint256"])(
      getMarketContractInstance().address,
      lastSellOfferId.toString()
    ),
    pageSize = PAGE_SIZE,
  } = {}
) => async dispatch => {
  try {
    const sellOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
    dispatch(loadSellOffers.pending(sellOffersTradingPair));

    let currentOfferId = undefined;
    while (currentOfferId !== null) {
      if (!currentOfferId)
        dispatch(resetSellOffers(sellOffersTradingPair));
      const page = currentOfferId ? nextPage(currentOfferId) : firstPage(sellToken, buyToken);
      const pageResult = parseAndSyncOffersPage(await page,
        { dispatch, sellToken, buyToken },
        { pageSize }
      );
      let {lastOfferId, shouldBacktrack} = pageResult;
      currentOfferId = !shouldBacktrack ? lastOfferId :
        (currentOfferId ? undefined : null);
    }

    dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
    return loadSellOffers;
  } catch (e) {
    console.log(e)
    dispatch(loadSellOffers.rejected(e));
  }
};

export const loadBuyOffers = createPromiseActions("OFFERS/LOAD_BUY_OFFERS");
export const loadBuyOffersEpic = (
  offersLoadMeta,
  buyToken,
  sellToken, {
    firstPage = (sellToken, buyToken) => getOTCSupportMethodsContractInstance().getOffers(
      getMarketContractInstance().address,
      getTokenContractInstance(sellToken).address,
      getTokenContractInstance(buyToken).address
    ),
    nextPage = (lastSellOfferId) => promisify(getOTCSupportMethodsNoProxyContractInstance().getOffers["address,uint256"])(
      getMarketContractInstance().address,
      lastSellOfferId.toString()
    ),
    pageSize = PAGE_SIZE,
  } = {}
) => async dispatch => {
  try {
    const buyOffersTradingPair = { baseToken: buyToken, quoteToken: sellToken };
    dispatch(loadBuyOffers.pending(buyOffersTradingPair));

    let currentOfferId = undefined;
    while (currentOfferId !== null) {
      if (!currentOfferId)
        dispatch(resetBuyOffers(buyOffersTradingPair));
      const page = currentOfferId ? nextPage(currentOfferId) : firstPage(sellToken, buyToken);
      const pageResult = parseAndSyncOffersPage(await page,
        { dispatch, sellToken, buyToken },
        { pageSize }
      );
      let {lastOfferId, shouldBacktrack} = pageResult;
      currentOfferId = !shouldBacktrack ? lastOfferId :
        (currentOfferId ? undefined : null);
    }

    dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair));
    return loadBuyOffers;
  } catch (e) {
    console.log(e)
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
