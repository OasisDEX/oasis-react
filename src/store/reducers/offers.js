/* eslint-disable no-unused-vars */
import { createAction, handleActions } from 'redux-actions';
import { fromJS, List, Map } from 'immutable';
import BigNumber from 'bignumber.js';

import { fulfilled, pending } from '../../utils/store';
import { createPromiseActions } from '../../utils/createPromiseActions';
import tokens from '../selectors/tokens';
import getTokenByAddress from '../../utils/tokens/getTokenByAddress';
import { convertTo18Precision } from '../../utils/conversion';
import network from '../selectors/network';
import { TX_OFFER_CANCEL } from './transactions';
import offers from '../selectors/offers';
import findOffer from '../../utils/offers/findOffer';
import getOfferTradingPairAndType from '../../utils/offers/getOfferTradingPairAndType';
import { handleTransaction } from '../../utils/transactions/handleTransaction';
import offerTakes from '../selectors/offerTakes';
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_ERROR, SYNC_STATUS_PENDING, SYNC_STATUS_PRISTINE } from '../../constants';
import { getMarketContractInstance, getTokenContractInstance } from '../../bootstrap/contracts';

export const TYPE_BUY_OFFER = 'OFFERS/TYPE_BUY';
export const TYPE_SELL_OFFER = 'OFFERS/TYPE_SELL';

const initialState = fromJS({
  offers: {},
  syncingOffers: [],
  pendingOffers: [],
  initialSyncStatus: {},
  loadingSellOffers: {},
  loadingBuyOffers: {},
  offersInitialized: false,
  activeTradingPairBestOfferId : {}
});


const UPDATE_OFFER = 'OFFERS/UPDATE_OFFER';

const BUY_GAS = 1000000;
const CANCEL_GAS = 1000000;


export const OFFER_SYNC_TYPE_INITIAL = 'OFFERS/OFFER_SYNC_TYPE_INITIAL';
export const OFFER_SYNC_TYPE_UPDATE = 'OFFERS/OFFER_SYNC_TYPE_UPDATE';
export const OFFER_SYNC_TYPE_NEW_OFFER = 'OFFERS/OFFER_SYNC_NEW_OFFER';

export const OFFER_STATUS_INACTIVE = 'OFFERS/OFFER_STATUS_INACTIVE';

const resetOffers = createAction(
  'OFFERS/RESET_OFFERS',
  ({ baseToken, quoteToken }) => ({ baseToken, quoteToken }),
);

const getBestOffer = createAction(
  'OFFERS/GET_BEST_OFFER',
  async (sellToken, buyToken) => {
    const sellTokenAddress = getTokenContractInstance(sellToken).address;
    const buyTokenAddress = getTokenContractInstance(buyToken).address;
    return getMarketContractInstance().getBestOffer(sellTokenAddress, buyTokenAddress);
  },
);

const cancelOffer = createAction(
  'OFFERS/CANCEL_OFFER',
  (offerId) =>
    getMarketContractInstance().cancel(offerId, { gas: CANCEL_GAS }),
);
const cancelOfferEpic = (offer, withCallbacks = {}) => dispatch => {
  return handleTransaction({
    dispatch,
    transactionDispatcher: () => dispatch(cancelOffer(offer.get('id'))),
    transactionType: TX_OFFER_CANCEL,
    txMeta: { offerId: offer.id },
    withCallbacks
  });
};

const getWorseOffer = createAction(
  'OFFERS/GET_WORSE_OFFER',
  offerId => getMarketContractInstance().getWorseOffer(offerId),
);

const loadOffer = createAction(
  'OFFERS/LOAD_OFFER',
  async (offerId) => getMarketContractInstance().offers(offerId),
);

const syncOffer = (offerId, syncType = OFFER_SYNC_TYPE_INITIAL, previousOfferState, {
  doLoadOffer = loadOffer,
  doGetOfferTradingPairAndType = getOfferTradingPairAndType,
  doGetTradingPairOfferCount = getTradingPairOfferCount,
  doSetOfferEpic = setOfferEpic,
} = {}) => async (dispatch, getState) => {

  const offer = (await dispatch(doLoadOffer(offerId))).value;
  // const isBuyEnabled = Session.get('isBuyEnabled');
  const [
    sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress, owner, timestamp,
  ] = offer;

  const { baseToken, quoteToken, offerType } = doGetOfferTradingPairAndType(
    { buyWhichTokenAddress, sellWhichTokenAddress, syncType }, getState(),
  );

  const id = offerId.toString();
  await dispatch(
    doGetTradingPairOfferCount(baseToken, quoteToken),
  );

  dispatch(doSetOfferEpic(Object.assign({
    id,
    sellHowMuch,
    sellWhichTokenAddress,
    buyHowMuch,
    buyWhichTokenAddress,
    owner,
    timestamp,
    offerType,
    tradingPair: { baseToken, quoteToken },
    syncType: syncType,
  }, syncType == OFFER_SYNC_TYPE_UPDATE ? {previousOfferState} : {})));

  return {
    offer,
    offerMeta: { baseToken, quoteToken, offerType },
  };
};

const loadBuyOffers = createPromiseActions('OFFERS/LOAD_BUY_OFFERS');
const loadBuyOffersEpic = (offerCount, sellToken, buyToken, {
  doGetBestOffer = getBestOffer,
  doSyncOffer = syncOffer,
  doGetWorseOffer = getWorseOffer,
} = {}) => async (dispatch) => {
  let currentBuyOfferId = (await dispatch(doGetBestOffer(buyToken, sellToken))).value.toNumber();
  const buyOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
  dispatch(loadBuyOffers.pending(buyOffersTradingPair));
  while (currentBuyOfferId !== 0) {
    // console.log({currentBuyOfferId})
    dispatch(doSyncOffer(currentBuyOfferId));
    currentBuyOfferId = (await dispatch(doGetWorseOffer(currentBuyOfferId))).value.toNumber();
    --offerCount.buyOfferCount;
    if (!offerCount.buyOfferCount) {
      dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair));
    }
  }
  return loadBuyOffers;
};

const loadSellOffers = createPromiseActions('OFFERS/LOAD_SELL_OFFERS');
const loadSellOffersEpic = (offerCount, sellToken, buyToken, {
  doGetBestOffer = getBestOffer,
  doSyncOffer = syncOffer,
  doGetWorseOffer = getWorseOffer,
} = {}) => async (dispatch) => {
  let currentSellOfferId = (await dispatch(doGetBestOffer(sellToken, buyToken))).value.toNumber();
  const sellOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
  dispatch(loadSellOffers.pending(sellOffersTradingPair));
  while (currentSellOfferId !== 0) {
    dispatch(doSyncOffer(currentSellOfferId));
    currentSellOfferId = (await dispatch(doGetWorseOffer(currentSellOfferId))).value.toNumber()
    --offerCount.sellOfferCount;
    if (!offerCount.sellOfferCount) {
      dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
    }
  }
  return loadSellOffers;
};

const tradingPairOffersAlreadyLoaded = createAction('OFFERS/TRADING_PAIR_ALREADY_LOADED');
const syncOffers = createPromiseActions('OFFERS/SYNC_OFFERS');
const syncOffersEpic = ({ baseToken, quoteToken }, {
  doGetTradingPairOfferCount = getTradingPairOfferCount,
  doLoadBuyOffersEpic = loadBuyOffersEpic,
  doLoadSellOffersEpic = loadSellOffersEpic,
} = {}) => async (dispatch, getState) => {

  if (offers.activeTradingPairOffersInitialLoadStatus(getState()) !== SYNC_STATUS_PRISTINE) {
    return dispatch(tradingPairOffersAlreadyLoaded({ baseToken, quoteToken }));
  }
  dispatch(syncOffers.pending({ baseToken, quoteToken }));
  dispatch(resetOffers({ baseToken, quoteToken }));
  const offerCount = (await dispatch(doGetTradingPairOfferCount(baseToken, quoteToken))).value;
  return Promise.all([
    dispatch(
      doLoadBuyOffersEpic(offerCount, baseToken, quoteToken))
      .catch(e => dispatch(loadBuyOffers.rejected(e))
    ),
    dispatch(
      doLoadSellOffersEpic(offerCount, baseToken, quoteToken))
      .catch(e => dispatch(loadSellOffers.rejected(e, { tradingPair: { baseToken, quoteToken } })
    ),
  )]).then(() => dispatch(syncOffers.fulfilled({ baseToken, quoteToken })));

};

const subscribeOffersEventsEpic = () => async (dispatch, getState) => {
  const latestBlockNumber = network.latestBlockNumber(getState());
  dispatch(
    subscribeNewOffersFilledInEpic(latestBlockNumber),
  );
  dispatch(
    subscribeFilledOrdersEpic(latestBlockNumber),
  );
  dispatch(
    subscribeCancelledOrdersEpic(latestBlockNumber),
  );

};

const setOffer = createAction(
  'OFFERS/SET_OFFER',
  ({ offer, baseToken, quoteToken, offerType }) => ({ offer, baseToken, quoteToken, offerType }),
);

const updateOffer = createAction(
  'OFFERS/UPDATE_OFFER',
  ({ offer, baseToken, quoteToken, offerType, previousOfferState }) =>
    ({ offer, baseToken, quoteToken, offerType, previousOfferState }),
);

const setOfferEpic = ({
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
                        previousOfferState,
                      }, {
                        doGetTokenByAddress = getTokenByAddress,
                      } = {}) => async (dispatch, getState) => {

  const sellToken = doGetTokenByAddress(sellWhichTokenAddress);
  const buyToken = doGetTokenByAddress(buyWhichTokenAddress);

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
      buyHowMuchValue.div(sellHowMuchValue).toFixed(precision < 5 ? 5 : precision, 6), 10,
    ).toNumber(),
    bid_price_sort: new BigNumber(
      sellHowMuchValue.div(buyHowMuchValue).toFixed(precision < 5 ? 5 : precision, 6), 10,
    ).toNumber(),
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
        alert('filled in completely')
        console.log('COMPLETE FILLED_IN',{
          sellHowMuch,
          sellWhichTokenAddress,
          buyHowMuch,
          buyWhichTokenAddress,
          owner,
          status,
          offerType,
          tradingPair: { baseToken, quoteToken },
          previousOfferState,
        })
        dispatch(
          offerCompletelyFilledIn(
            { baseToken, quoteToken, offerType, offerId: id, updatedOffer: offer, previousOfferState },
          ),
        );
      } else {
        dispatch(updateOffer({ offer, baseToken, quoteToken, offerType }));
        dispatch(
          offerPartiallyFilledIn(
            { baseToken, quoteToken, offerType, offerId: id, updatedOffer: offer, previousOfferState },
          ),
        );
      }
      break;
  }
};

const getTradingPairOfferCount = createAction(
  'OFFERS/GET_TRADING_PAIR_OFFERS_COUNT',
  async (baseToken, quoteToken) => {
    const baseAddress = getTokenContractInstance(baseToken).address;
    const quoteAddress = getTokenContractInstance(quoteToken).address;
    return {
      baseToken, quoteToken,
      buyOfferCount: (await getMarketContractInstance().getOfferCount(quoteAddress, baseAddress)).toNumber(),
      sellOfferCount: (await getMarketContractInstance().getOfferCount(baseAddress, quoteAddress)).toNumber(),
    };
  },
);

/**
 * New offer is filled in
 * - sync offer
 *
 */
const newOfferFilledIn = createAction('OFFERS/NEW_OFFER_FILLED_IN', offerId => offerId);
const subscribeNewOffersFilledInEpic = (fromBlock, filter = {}) => async dispatch => {
  getMarketContractInstance().LogMake(filter, { fromBlock, toBlock: 'latest' })
    .then((err, LogMakeEvent) => {
      const newOfferId = parseInt(LogMakeEvent.args.id, 16);
      dispatch(
        newOfferFilledIn(newOfferId),
      );
      console.log({ LogMakeEvent })
    });
};

const offerCancelledEvent = createAction(
  'OFFERS/EVENT___OFFER_CANCELLED', data => data,
);

const subscribeCancelledOrders = createPromiseActions(
  'OFFERS/SUBSCRIBE_CANCELLED_OFFERS',
);
const subscribeCancelledOrdersEpic = (fromBlock, filter = {}) => async (dispatch, getState) => {
  dispatch(subscribeCancelledOrders.pending());
  try {
    getMarketContractInstance().LogKill(filter, { fromBlock, toBlock: 'latest' }).then(
      (err, LogKillEvent) => {
        const {
          id,
          pair,
          maker,
          pay_gem,
          buy_gem,
          timestamp
        } = LogKillEvent.args;

        const { baseToken, quoteToken, offerType } = getOfferTradingPairAndType({
          id,
          pair,
          buyWhichTokenAddress: buy_gem,
          sellWhichTokenAddress: pay_gem,
          syncType: UPDATE_OFFER,
        }, getState(), true);
        console.log('LogKillEvent', id, LogKillEvent);
        dispatch(
          offerCancelledEvent(
            {
              maker,
              offerType,
              offerId: parseInt(id, 16).toString(),
              tradingPair: { baseToken, quoteToken },
              timestamp
            },
          ),
        );
        dispatch(
          getTradingPairOfferCount(baseToken, quoteToken),
        );

      },
    );
  } catch (e) {
    dispatch(subscribeCancelledOrders.rejected(e));
  }
  dispatch(subscribeCancelledOrders.fulfilled());
};

const subscribeFilledOrders = createPromiseActions(
  'OFFERS/SUBSCRIBE_FILLED_OFFERS',
);

const offerPartiallyFilledIn = createAction(
  'OFFERS/OFFER_PARTIALLY_FILLED_IN',
  ({ offerId, baseToken, quoteToken, offerType, updatedOffer, previousOfferState }) =>
    ({ offerId, baseToken, quoteToken, offerType, updatedOffer, previousOfferState }),
);
const offerCompletelyFilledIn = createAction(
  'OFFERS/OFFER_COMPLETELY_FILLED_IN',
  ({ offerId, baseToken, quoteToken, offerType, updatedOffer, previousOfferState }) =>
    ({ offerId, baseToken, quoteToken, offerType, updatedOffer, previousOfferState }),
);

const checkOfferIsActive = createAction(
  'OFFERS/CHECK_OFFER_IS_ACTIVE',
  offerId => getMarketContractInstance().isActive(offerId),
);


const removeOfferFromTheOrderBook = createAction(
  'OFFERS/REMOVE_OFFER_FROM_THE_ORDER_BOOK',
  ({ offerId, tradingPair, offerType }) =>  ({ offerId, tradingPair, offerType })
);


const markOfferAsInactive = createAction(
  'OFFERS/MARK_OFFER_AS_INACTIVE',
  ({ offerId, tradingPair, offerType }) =>  ({ offerId, tradingPair, offerType })
);

const subscribeFilledOrdersEpic = (fromBlock, filter = {}) => async (dispatch, getState) => {
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

const initOffers = createAction('OFFERS/INIT_OFFERS', initialOffersState => initialOffersState);
const initOffersEpic = () => (dispatch, getState) => {
  let initialOffersData = Map({});
  const initialTradingPairData = fromJS({
    buyOfferCount: null,
    sellOfferCount: null,
    buyOffers: List(),
    sellOffers: List(),
    initialSyncStatus: SYNC_STATUS_PRISTINE,
  });
  tokens.tradingPairs(getState())
    .forEach(tp =>
      initialOffersData = initialOffersData
        .set(
          Map({ baseToken: tp.get('base'), quoteToken: tp.get('quote') }),
          initialTradingPairData,
        ),
    );
  dispatch(initOffers(initialOffersData));
};


const setActiveTradingPairBestOfferIds = createAction('OFFERS/SET_ACTIVE_TRADING_PAIR_BEST_OFFER_IDS',
  ({ bestBuyOfferId, bestSellOfferId }) => ({ bestBuyOfferId, bestSellOfferId })
);
const getBestOfferIdsForActiveTradingPairEpic = () => async (dispatch, getState) => {
  const tradingPair = tokens.activeTradingPair(getState()) !== null
    ? fromJS(tokens.activeTradingPair(getState()))
    : tokens.defaultTradingPair(getState());
  const [baseToken, quoteToken] = [
    tradingPair.get("baseToken"),
    tradingPair.get("quoteToken")
  ];
  const bestBuyOfferId = (
    await
      dispatch(
        getBestOffer(quoteToken, baseToken,
        )
    )
  ).value;

  const bestSellOfferId = (
    await
      dispatch(
        getBestOffer(baseToken, quoteToken
        )
      )
  ).value;

  dispatch(
    setActiveTradingPairBestOfferIds({
      bestBuyOfferId: bestBuyOfferId.toString(), bestSellOfferId: bestSellOfferId.toString()
    })
  );
};


const removeOrderCancelledByTheOwner = createAction(
  'OFFER/REMOVE_OFFER_CANCELLED_BY_THE_OWNER',
  ({ offerType, offerId, tradingPair }) => ({ offerType, offerId, tradingPair })
);

const actions = {
  initOffersEpic,
  cancelOfferEpic,
  syncOffersEpic,
  subscribeOffersEventsEpic,
  checkOfferIsActive,
  getBestOfferIdsForActiveTradingPairEpic,
  markOfferAsInactive,
  removeOrderCancelledByTheOwner
};

const testActions = {
  syncOffer,
  setOfferEpic,
  loadBuyOffersEpic,
  loadSellOffersEpic,
};

const reducer = handleActions({
  [initOffers]: (state, { payload }) => {
    return state.updateIn(['offers'], () => payload).set('offersInitialized', () => true);
  },
  [syncOffers.pending]: (state, { payload }) =>
    state.updateIn(['offers', Map(payload), 'initialSyncStatus'], () => SYNC_STATUS_PENDING),
  [syncOffers.fulfilled]: (state, { payload }) =>
    state.updateIn(['offers', Map(payload), 'initialSyncStatus'], () => SYNC_STATUS_COMPLETED),
  [syncOffers.rejected]: (state, { payload }) =>
    state.updateIn(['offers', Map(payload), 'initialSyncStatus'], () => SYNC_STATUS_ERROR),
  [fulfilled(getTradingPairOfferCount)]:
    (state, { payload: { baseToken, quoteToken, buyOfferCount, sellOfferCount } }) => {
      // console.log('getTradingPairOfferCount', baseToken, quoteToken);
      return state.updateIn(
        ['offers', Map({ baseToken, quoteToken })],
        tradingPairOffers => {
          return tradingPairOffers
            .updateIn(['buyOfferCount'], () => buyOfferCount)
            .updateIn(['sellOfferCount'], () => sellOfferCount);
        },
      );
    },
  [pending(loadOffer)]: state => state,
  [fulfilled(loadOffer)]: state => state,
  [setOffer]: (state, { payload: { offer, baseToken, quoteToken, offerType } }) => {
    return state.updateIn(
      ['offers', Map({ baseToken, quoteToken })], tradingPairOffers => {
        switch (offerType) {
          case TYPE_BUY_OFFER :
            return tradingPairOffers.updateIn(['buyOffers'], buyOffers => buyOffers.push(offer));
          case TYPE_SELL_OFFER:
            return tradingPairOffers.updateIn(['sellOffers'], sellOffers => sellOffers.push(offer));
          default: {
            console.log(
              'this should never happen !!!', { offer, baseToken, quoteToken, offerType },
            );
            return tradingPairOffers;
          }
        }
      },
    );
  },
  [updateOffer]: (state, { payload: { offer, baseToken, quoteToken, offerType } }) =>
    state.updateIn(
      ['offers', Map({ baseToken, quoteToken })], tradingPairOffers => {
        switch (offerType) {
          case TYPE_BUY_OFFER :
            return tradingPairOffers.updateIn(['buyOffers'], buyOffers =>
              buyOffers.update(buyOffers.findIndex(
                buyOffer => buyOffer.id == offer.id), () => offer,
              ),
            );
          case TYPE_SELL_OFFER:
            return tradingPairOffers.updateIn(['sellOffers'], sellOffers =>
              sellOffers.update(sellOffers.findIndex(
                sellOffer => sellOffer.id == offer.id), () => offer,
              ),
            );
        }
      },
    ),
  // [pending(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_PENDING),
  // [fulfilled(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_COMPLETED),
  // [rejected(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_ERROR),

  [loadBuyOffers.pending]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_PENDING),
  [loadBuyOffers.fulfilled]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_COMPLETED),
  [loadBuyOffers.rejected]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingBuyOffers'], SYNC_STATUS_ERROR),

  [loadSellOffers.pending]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_PENDING),
  [loadSellOffers.fulfilled]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_COMPLETED),
  [loadSellOffers.rejected]: (state, { payload }) =>
    state.setIn(['offers', Map(payload), 'loadingSellOffers'], SYNC_STATUS_ERROR),
  [offerCancelledEvent]: (state, { payload: { tradingPair, offerType, offerId } }) => {
    switch (offerType) {
      case TYPE_BUY_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'buyOffers'],
            buyOfferList => buyOfferList.filter(offer => offer.id !== offerId),
          );
      case TYPE_SELL_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'sellOffers'],
            sellOfferList => sellOfferList.filter(offer => offer.id !== offerId),
          );

    }
  },
  // [offerPartiallyFilledIn]:
  //   (state, { payload: { offerId, tradingPair, offerType, updatedOffer, previousOfferState } }) => state,
  [offerCompletelyFilledIn]:
    (state, { payload: { offerId, tradingPair, offerType } }) => {
      switch (offerType) {
        case TYPE_BUY_OFFER:
          return state
            .updateIn(['offers', Map(tradingPair), 'buyOffers'],
              buyOfferList => buyOfferList.filter(offer => offer.id !== offerId),
            );
        case TYPE_SELL_OFFER:
          return state
            .updateIn(['offers', Map(tradingPair), 'sellOffers'],
              sellOfferList => sellOfferList.filter(offer => offer.id !== offerId),
            );

      }
    },
  [setActiveTradingPairBestOfferIds]:
    (state, {payload: { bestBuyOfferId, bestSellOfferId }}) =>
      state
        .setIn(['activeTradingPairBestOfferId', 'bestBuyOfferId'], bestBuyOfferId)
        .setIn(['activeTradingPairBestOfferId', 'bestSellOfferId'], bestSellOfferId),
  [removeOrderCancelledByTheOwner]: (state, { payload: { tradingPair, offerType, offerId } }) => {
    switch (offerType) {
      case TYPE_BUY_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'buyOffers'],
            buyOfferList => buyOfferList.filter(offer => offer.id !== offerId),
          );
      case TYPE_SELL_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'sellOffers'],
            sellOfferList => sellOfferList.filter(offer => offer.id !== offerId),
          );

    }
  },
  [removeOfferFromTheOrderBook]: (state, { payload: { tradingPair, offerType, offerId } }) => {
    switch (offerType) {
      case TYPE_BUY_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'buyOffers'],
            buyOfferList => buyOfferList.filter(offer => offer.id !== offerId),
          );
      case TYPE_SELL_OFFER:
        return state
          .updateIn(['offers', Map(tradingPair), 'sellOffers'],
            sellOfferList => sellOfferList.filter(offer => offer.id !== offerId),
          );

    }
  },
  [markOfferAsInactive]: (state, { payload: { offerId, offer, tradingPair, offerType } }) =>
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
}, initialState);

export default {
  actions,
  testActions,
  reducer,
};
