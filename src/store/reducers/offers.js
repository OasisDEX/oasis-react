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


const OFFER_SYNC_TYPE_INITIAL = 'OFFERS/OFFER_SYNC_TYPE_INITIAL';
const OFFER_SYNC_TYPE_UPDATE = 'OFFERS/OFFER_SYNC_TYPE_UPDATE';
const OFFER_SYNC_TYPE_NEW_OFFER = 'OFFERS/OFFER_SYNC_NEW_OFFER';

export const OFFER_STATUS_INACTIVE = 'OFFERS/OFFER_STATUS_INACTIVE';

const resetOffers = createAction(
  'OFFERS/RESET_OFFERS',
  ({ baseToken, quoteToken }) => ({ baseToken, quoteToken }),
);

const getBestOffer = createAction(
  'OFFERS/GET_BEST_OFFER',
  async (sellToken, buyToken) => {
    const sellTokenAddress = window.contracts.tokens[sellToken].address;
    const buyTokenAddress = window.contracts.tokens[buyToken].address;
    return window.contracts.market.getBestOffer(sellTokenAddress, buyTokenAddress);
  },
);

const cancelOffer = createAction(
  'OFFERS/CANCEL_OFFER',
  (offerId) =>
    window.contracts.market.cancel(offerId, { gas: CANCEL_GAS }),
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
  offerId => window.contracts.market.getWorseOffer(offerId),
);

const loadOffer = createAction(
  'OFFERS/LOAD_OFFER',
  async (offerId) => window.contracts.market.offers(offerId),
);

const syncOffer = (offerId, syncType = OFFER_SYNC_TYPE_INITIAL, previousOfferState) => async (dispatch, getState) => {
  const offer = (await dispatch(loadOffer(offerId))).value;
  // const isBuyEnabled = Session.get('isBuyEnabled');
  const [
    sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress, owner, timestamp,
  ] = offer;

  const { baseToken, quoteToken, offerType } = getOfferTradingPairAndType(
    { buyWhichTokenAddress, sellWhichTokenAddress, syncType }, getState(),
  );

  const id = offerId.toString();
  await dispatch(
    getTradingPairOfferCount(baseToken, quoteToken),
  );

  switch (syncType) {

    case OFFER_SYNC_TYPE_INITIAL:
      dispatch(
        setOfferEpic({
          id,
          sellHowMuch,
          sellWhichTokenAddress,
          buyHowMuch,
          buyWhichTokenAddress,
          owner,
          timestamp,
          offerType,
          tradingPair: { baseToken, quoteToken },
          syncType: OFFER_SYNC_TYPE_INITIAL,
        }),
      );
      break;

    case OFFER_SYNC_TYPE_NEW_OFFER:
      dispatch(
        setOfferEpic({
          id,
          sellHowMuch,
          sellWhichTokenAddress,
          buyHowMuch,
          buyWhichTokenAddress,
          owner,
          timestamp,
          tradingPair: { baseToken, quoteToken },
          offerType,
          syncType: OFFER_SYNC_TYPE_NEW_OFFER,
        }),
      );
      break;

    case OFFER_SYNC_TYPE_UPDATE: {
      dispatch(
        setOfferEpic({
          id,
          sellHowMuch,
          sellWhichTokenAddress,
          buyHowMuch,
          buyWhichTokenAddress,
          owner,
          timestamp,
          tradingPair: { baseToken, quoteToken },
          offerType,
          syncType: OFFER_SYNC_TYPE_UPDATE,
          previousOfferState,
        }),
      );
      break;
    }
  }

  return {
    offer,
    offerMeta: { baseToken, quoteToken, offerType },
  };
};

const loadBuyOffers = createPromiseActions('OFFERS/LOAD_BUY_OFFERS');
const loadBuyOffersEpic = (offerCount, sellToken, buyToken) => async (dispatch) => {
  let currentBuyOfferId = (await dispatch(getBestOffer(buyToken, sellToken))).value.toNumber();
  const buyOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
  dispatch(loadBuyOffers.pending(buyOffersTradingPair));
  while (currentBuyOfferId !== 0) {
    // console.log({currentBuyOfferId})
    dispatch(syncOffer(currentBuyOfferId));
    currentBuyOfferId = (await dispatch(getWorseOffer(currentBuyOfferId))).value.toNumber();
    --offerCount.buyOfferCount;
    if (!offerCount.buyOfferCount) {
      dispatch(loadBuyOffers.fulfilled(buyOffersTradingPair));
    }
  }
  return loadBuyOffers;
};

const loadSellOffers = createPromiseActions('OFFERS/LOAD_SELL_OFFERS');
const loadSellOffersEpic = (offerCount, sellToken, buyToken) => async (dispatch) => {
  let currentSellOfferId = (await dispatch(getBestOffer(sellToken, buyToken))).value.toNumber();
  const sellOffersTradingPair = { baseToken: sellToken, quoteToken: buyToken };
  dispatch(loadSellOffers.pending(sellOffersTradingPair));
  while (currentSellOfferId !== 0) {
    dispatch(syncOffer(currentSellOfferId));
    currentSellOfferId = (await dispatch(getWorseOffer(currentSellOfferId))).value.toNumber()
    --offerCount.sellOfferCount;
    if (!offerCount.sellOfferCount) {
      dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
    }
  }
  return loadSellOffers;
};

const tradingPairOffersAlreadyLoaded = createAction('OFFERS/TRADING_PAIR_ALREADY_LOADED');
const syncOffers = createPromiseActions('OFFERS/SYNC_OFFERS');
const syncOffersEpic = ({ baseToken, quoteToken }) => async (dispatch, getState) => {

  if (offers.activeTradingPairOffersInitialLoadStatus(getState()) !== SYNC_STATUS_PRISTINE) {
    return dispatch(tradingPairOffersAlreadyLoaded({ baseToken, quoteToken }));
  }
  dispatch(syncOffers.pending({ baseToken, quoteToken }));
  dispatch(resetOffers({ baseToken, quoteToken }));
  const offerCount = (await dispatch(getTradingPairOfferCount(baseToken, quoteToken))).value;
  Promise.all([
    dispatch(loadBuyOffersEpic(offerCount, baseToken, quoteToken)).catch(
      e => dispatch(loadBuyOffers.rejected(e)),
    ),
    dispatch(loadSellOffersEpic(offerCount, baseToken, quoteToken)).catch(
      e => dispatch(loadSellOffers.rejected(e, { tradingPair: { baseToken, quoteToken } })),
    ),
  ]).then(() => dispatch(syncOffers.fulfilled({ baseToken, quoteToken })));

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
    const baseAddress = window.contracts.tokens[baseToken].address;
    const quoteAddress = window.contracts.tokens[quoteToken].address;
    return {
      baseToken, quoteToken,
      buyOfferCount: (await window.contracts.market.getOfferCount(quoteAddress, baseAddress)).toNumber(),
      sellOfferCount: (await window.contracts.market.getOfferCount(baseAddress, quoteAddress)).toNumber(),
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
  window.contracts.market.LogMake(filter, { fromBlock, toBlock: 'latest' })
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
    window.contracts.market.LogKill(filter, { fromBlock, toBlock: 'latest' }).then(
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
  offerId => window.contracts.market.isActive(offerId),
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
  window.contracts.market.LogItemUpdate(filter, { fromBlock, toBlock: 'latest' }).then(
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

  /** When the order matching is activated we are using ItemUpdate only to listen for events
   * where a given order is getting cancelled or filled in ( in case of `buy` being enabled.*/
  // window.contracts.market.LogItemUpdate((err, result) => {
  //   if (!err) {
  //     const idx = result.args.id;
  //     Dapple['maker-otc'].objects.otc.offersReducer(idx.toNumber(), (error, data) => {
  //       if (!error) {
  //         const offer = Offers.findOne({ _id: idx.toString() });
  //
  //         if (offer) {
  //           const [, , , , , active] = data;
  //           Offers.syncOffer(idx.toNumber());
  /**
   * When the order matching is enabled there is check on the contract side
   * before the creating new order.
   * It checks if the new order is about to match existing one. There are couple of scenarios:
   *
   *  - New order is filled in completely but the existing one is completed partially or completely
   *    = then no order is actually created on the blockchain so the UI has offer is transaction id only.
   *
   *  - New order is not filled in completely but fills the existing one completely
   *    = then new order is created with the remainings after the matching is done.
   *
   * Transaction hash of the event in the first case scenario, corresponds to the transaction hash,
   * used to store the offer on the client. In order to update the UI accordingly, when the first scenario is met
   * we used the transaction has to remove the new order from the collection.
   * */
  // Offers.remove(result.transactionHash);
  // if (!active) {
  //   Offers.remove(idx.toString());
  // }
  // }
  // }
  // });
  // }
  // });

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
  reducer,
};
