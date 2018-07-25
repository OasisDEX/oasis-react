import offers from "../../selectors/offers";
import { createPromiseActions } from "../../../utils/createPromiseActions";
import { loadBuyOffersEpic, loadSellOffersEpic } from "./loadOffers";
import { createAction } from "redux-actions";
import {
  SYNC_STATUS_COMPLETED,
  SYNC_STATUS_ERROR,
  SYNC_STATUS_PENDING,
  SYNC_STATUS_PRISTINE
} from "../../../constants";
import {
  getMarketContractInstance,
  getTokenContractInstance
} from "../../../bootstrap/contracts";
import { handleTransaction } from "../../../utils/transactions/handleTransaction";
import { TX_OFFER_CANCEL } from "../transactions";
import { CANCEL_GAS } from "../offers";
import { getTradingPairOfferCount } from "./getTradingPairOffersCount";
import { Map, List } from "immutable";
import network from "../../selectors/network";
import { reSyncOffersEpic } from "./reSyncOffers";
import offersReducer from './index';

export const tradingPairOffersAlreadyLoaded = createAction(
  "OFFERS/TRADING_PAIR_ALREADY_LOADED"
);

export const resetBuyOffers = createAction(
  "OFFERS/RESET_BUY_OFFERS",
  ({ baseToken, quoteToken }) => ({ baseToken, quoteToken })
);

export const resetSellOffers = createAction(
  "OFFERS/RESET_SELL_OFFERS",
  ({ baseToken, quoteToken }) => ({ baseToken, quoteToken })
);

export const getBestOffer = createAction(
  "OFFERS/GET_BEST_OFFER",
  async (sellToken, buyToken) => {
    const sellTokenAddress = getTokenContractInstance(sellToken).address;
    const buyTokenAddress = getTokenContractInstance(buyToken).address;
    return getMarketContractInstance().getBestOffer(
      sellTokenAddress,
      buyTokenAddress
    );
  }
);

export const cancelOffer = createAction("OFFERS/CANCEL_OFFER", offerId =>
  getMarketContractInstance().cancel(offerId, { gas: CANCEL_GAS })
);
export const cancelOfferEpic = (offer, withCallbacks = {}) => dispatch => {
  return handleTransaction({
    dispatch,
    transactionDispatcher: () => dispatch(cancelOffer(offer.get("id"))),
    transactionType: TX_OFFER_CANCEL,
    txMeta: { offerId: offer.id },
    withCallbacks
  });
};

export const getWorseOffer = createAction("OFFERS/GET_WORSE_OFFER", offerId =>
  getMarketContractInstance().getWorseOffer(offerId)
);

export const syncOffers = createPromiseActions("OFFERS/SYNC_OFFERS");
export const syncOffersEpic = (
  { baseToken, quoteToken },
  {
    doGetTradingPairOfferCount = getTradingPairOfferCount,
    doLoadBuyOffersEpic = loadBuyOffersEpic,
    doLoadSellOffersEpic = loadSellOffersEpic,
    doGetBestOffer = null,
  } = {}
) => async (dispatch, getState) => {
  dispatch(offersReducer.actions.getBestOfferIdsForActiveTradingPairEpic(doGetBestOffer ? {doGetBestOffer} : {}));
  if (
    offers.activeTradingPairOffersInitialLoadStatus(getState()) !==
    SYNC_STATUS_PRISTINE
  ) {
    return dispatch(tradingPairOffersAlreadyLoaded({ baseToken, quoteToken }));
  }

  dispatch(
    syncOffers.pending({
      tradingPair: { baseToken, quoteToken },
      syncStartBlockNumber: network.latestBlockNumber(getState())
    })
  );
  const offerCount = (await dispatch(
    doGetTradingPairOfferCount(baseToken, quoteToken)
  )).value;
  return Promise.all([
    dispatch(doLoadBuyOffersEpic(offerCount, baseToken, quoteToken)),
    dispatch(doLoadSellOffersEpic(offerCount, baseToken, quoteToken))
  ]).then(async () => {
    const reSyncRetryIntervalId =setInterval(async () => {
      try {
        dispatch(reSyncOffersEpic({ baseToken, quoteToken }));
        await doGetTradingPairOfferCount(baseToken, quoteToken);
        dispatch(
          syncOffers.fulfilled({
            tradingPair: { baseToken, quoteToken },
            syncEndBlockNumber: network.latestBlockNumber(getState())
          })
        );
        clearInterval(reSyncRetryIntervalId);
      } catch (e) {
        console.warn("Disconnected while re-syncing offers. Will try reconnect in 1s.", e.toString())
      }
    }, 1000)
  });
};

export const reducer = {
  [syncOffers.pending]: (
    state,
    { payload: { tradingPair, syncStartBlockNumber } }
  ) =>
    state
      .setIn(
        ["offers", Map(tradingPair), "initialSyncMeta", "syncStartBlockNumber"],
        syncStartBlockNumber
      )
      .updateIn(
        ["offers", Map(tradingPair), "initialSyncStatus"],
        () => SYNC_STATUS_PENDING
      ),
  [syncOffers.fulfilled]: (
    state,
    { payload: { tradingPair, syncEndBlockNumber } }
  ) =>
    state
      .setIn(
        ["offers", Map(tradingPair), "initialSyncMeta", "syncEndBlockNumber"],
        syncEndBlockNumber
      )
      .updateIn(
        ["offers", Map(tradingPair), "initialSyncStatus"],
        () => SYNC_STATUS_COMPLETED
      ),
  [syncOffers.rejected]: (state, { payload }) =>
    state.updateIn(
      ["offers", Map(payload), "initialSyncStatus"],
      () => SYNC_STATUS_ERROR
    ),
  // [pending(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_PENDING),
  // [fulfilled(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_COMPLETED),
  // [rejected(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_ERROR),
  'OFFERS/RESET_BUY_OFFERS': (state, { payload }) =>
    state.updateIn(
      ["offers", Map(payload), "buyOffers"],
      () => List()
    ),
  'OFFERS/RESET_SELL_OFFERS': (state, { payload }) =>
    state.updateIn(
      ["offers", Map(payload), "sellOffers"],
      () => List()
    ),
};
