/* eslint-disable no-unused-vars */
import { createAction, handleActions } from 'redux-actions';
import { fromJS, List, Map } from 'immutable';
import BigNumber from 'bignumber.js';

import { fulfilled, pending } from '../../utils/store';
import { createPromiseActions } from '../../utils/createPromiseActions';
import tokens from '../selectors/tokens';
import getTokenByAddress from '../../utils/tokens/getTokenByAddress';
import { web3p } from '../../bootstrap/web3';
import { convertTo18Precision } from '../../utils/conversion';
import network from '../selectors/network';
import transactions, { TX_OFFER_CANCELLED, TX_STATUS_CANCELLED_BY_USER } from './transactions';
import offers from '../selectors/offers';
import findOffer from '../../utils/offers/findOffer';
import { STATUS_COMPLETED, STATUS_ERROR, STATUS_PRISTINE } from './platform';
import getOfferTradingPairAndType from '../../utils/offers/getOfferTradingPairAndType';

export const TYPE_BUY_OFFER = 'OFFERS/TYPE_BUY';
export const TYPE_SELL_OFFER = 'OFFERS/TYPE_SELL';

const SYNC_STATUS_PENDING = 'OFFERS/SYNC_STATUS_PENDING';
const SYNC_STATUS_COMPLETED = 'OFFERS/SYNC_STATUS_COMPLETED';
const SYNC_STATUS_ERROR = 'OFFERS/SYNC_STATUS_ERROR';

const initialState = fromJS({
  offers: {},
  syncingOffers: [],
  pendingOffers: [],
  initialSyncStatus: {},
  loadingSellOffers: {},
  loadingBuyOffers: {},
  offersInitialized: false,
});


const INIT = 'OFFERS/INIT';
const FETCH_TRADES_ISSUED_FOR_ADDRESS = 'OFFERS/FETCH_TRADES_ISSUED_FOR_ADDRESS';
const FETCH_TRADES_ACCEPTED_FOR_ADDRESS = 'OFFERS/FETCH_TRADES_ACCEPTED_FOR_ADDRESS';
const LISTEN_FOR_THE_NEW_SORTED_OFFERS = 'OFFERS/LISTEN_FOR_THE_NEW_SORTED_OFFERS';
const GET_HISTORICAL_TRADE_RANGE = 'OFFERS/GET_HISTORICAL_TRADE_RANGE';
const SYNC_OFFERS = 'OFFERS/SYNC_OFFERS';
const TRADING_PAIR_ALREADY_LOADED = 'OFFERS/TRADING_PAIR_ALREADY_LOADED';
const GET_BEST_OFFER = 'OFFERS/GET_BEST_OFFER';
const SYNC_OFFER = 'OFFERS/SYNC_OFFER';
const UPDATE_OFFER = 'OFFERS/UPDATE_OFFER';
const OFFER_CONTRACT_PARAMETERS = 'OFFERS/OFFER_CONTRACT_PARAMETERS';
const NEW_OFFER_GAS_ESTIMATE = 'OFFERS/NEW_OFFER_GAS_ESTIMATE';
const FILL_OFFER_GAS_ESTIMATE = 'OFFERS/FILL_OFFER_GAS_ESTIMATE';
const NEW_OFFER = 'OFFERS/NEW_OFFER';
const BUY_OFFER = 'OFFERS/BUY_OFFER';
const CANCEL_OFFER = 'OFFERS/CANCEL_OFFER';


const BUY_GAS = 1000000;
const CANCEL_GAS = 1000000;

const STATUS_PENDING = 'OFFER_STATUS_PENDING';
const STATUS_CONFIRMED = 'OFFER_STATUS_CONFIRMED';
const STATUS_CANCELLED = 'OFFER_STATUS_CANCELLED';
const STATUS_BOUGHT = 'OFFER_STATUS_BOUGHT';
const STATUS_OPEN = 'OFFER_STATUS_OPEN';
const STATUS_CLOSED = 'OFFER_STATUS_CLOSED';

const OFFER_SYNC_TYPE_INITIAL = 'OFFERS/OFFER_SYNC_TYPE_INITIAL';
const OFFER_SYNC_TYPE_UPDATE = 'OFFERS/OFFER_SYNC_TYPE_UPDATE';
const OFFER_SYNC_TYPE_NEW_OFFER = 'OFFERS/OFFER_SYNC_NEW_OFFER';

const OFFER_PARTIALLY_FILLED_IN = 'OFFERS/OFFER_PARTIALLY_FILLED_IN';
const OFFER_COMPLETELY_FILLED_IN = 'OFFERS/OFFER_COMPLETELY_FILLED_IN';

const Init = createAction(
  INIT,
  () => null,
);

const FetchTradesIssuedForAddress = createAction(
  FETCH_TRADES_ISSUED_FOR_ADDRESS,
  function fetchIssuedTradesFor(address) {
    return new Promise((resolve, reject) => {
      // Dapple['maker-otc'].objects.otc.LogTake({ maker: address }, {
      //   fromBlock: Dapple['maker-otc'].environments[Dapple.env].otc.blockNumber,
      //   toBlock: 'latest',
      // }).get((error, logTakes) => {
      //   if (!error) {
      //     for (let i = 0; i < logTakes.length; i++) {
      //       const trade = logTakeToTrade(logTakes[i]);
      //       const eventLogIndex = logTakes[i].logIndex;
      //       if (trade) {
      //         const uniqueId = trade.transactionHash + eventLogIndex;
      //         IndividualTrades.upsert(uniqueId, trade);
      //       }
      //     }
      //     resolve();
      //   } else {
      //     // TODO: Display this to the user in a fixed error display panel
      //     console.debug('Cannot fetch issued trades');
      //     reject();
      //   }
      // });
    });
  },
);

const FetchTradesAcceptedForAddress = createAction(
  FETCH_TRADES_ACCEPTED_FOR_ADDRESS,
  function fetchAcceptedTradesFor(address) {
    return new Promise((resolve, reject) => {
      // Dapple['maker-otc'].objects.otc.LogTake({ taker: address }, {
      //   fromBlock: Dapple['maker-otc'].environments[Dapple.env].otc.blockNumber,
      //   toBlock: 'latest',
      // }).get((error, logTakes) => {
      //   if (!error) {
      //     for (let i = 0; i < logTakes.length; i++) {
      //       const currentTrade = logTakes[i].args;
      //
      //       // We handle those scenario when we are filtering events base on maker property
      //       if (currentTrade.maker !== currentTrade.taker) {
      //         const trade = logTakeToTrade(logTakes[i]);
      //         const eventLogIndex = logTakes[i].logIndex;
      //         if (trade) {
      //           const uniqueId = trade.transactionHash + eventLogIndex;
      //           IndividualTrades.upsert(uniqueId, trade);
      //         }
      //       }
      //     }
      //     resolve();
      //   } else {
      //     // TODO: Display this to the user in a fixed error display panel
      //     console.debug('Cannot fetch accepted trades');
      //     reject();
      //   }
      // });
    });
  },
);


const ListenForTheNewSortedOffers = createAction(
  LISTEN_FOR_THE_NEW_SORTED_OFFERS,
  () => web3p.eth.filter(window.contracts.market.LogMake()),
);
// Dapple['maker-otc'].objects.otc.LogSortedOffer((err, result) => {
//   if (!err) {
//     const id = result.args.id.toNumber();
//     Offers.syncOffer(id);
//     Offers.remove(result.transactionHash);
//   } else {
//     console.debug('Error placing new sorted offer!', err);
//   }
// });

// const GetHistoricalTradesRange = createAction(
//   GET_HISTORICAL_TRADE_RANGE,
//   (numberOfPreviousDays) => {
    // after the initial jump we step back 1000 blocks at a time
    // We send one extra day just to have a buffer and be sure that the starBlock covers a full week of volume data
    // const INITIAL_NUMBER_OF_BLOCKS_BACKWARDS = Session.get('AVGBlocksPerDay') * (numberOfPreviousDays + 1 + 1);
    //
    // return getBlockNumberOfTheMostRecentBlock().then((blockNumberOfTheMostRecentBlock) => {
    //   const startTimestamp = moment(Date.now()).startOf('day').subtract(numberOfPreviousDays, 'days');
    //   const initialGuess = blockNumberOfTheMostRecentBlock - INITIAL_NUMBER_OF_BLOCKS_BACKWARDS;
    //
    //   const ret = {
    //     startBlockNumber: initialGuess,
    //     startTimestamp,
    //     endBlockNumber: blockNumberOfTheMostRecentBlock,
    //   };
    //   return ret;
    // });
  // },
// );

const resetOffers = createAction(
  'OFFERS/RESET_OFFERS',
  ({ baseToken, quoteToken }) => ({ baseToken, quoteToken }),
);

const getBestOffer = createAction(
  GET_BEST_OFFER,
  async (sellToken, buyToken) => {
    const sellTokenAddress = window.contracts.tokens[sellToken].address;
    const buyTokenAddress = window.contracts.tokens[buyToken].address;
    return window.contracts.market.getBestOffer(sellTokenAddress, buyTokenAddress);
  },
);

// const SyncOffer = createAction(
//   SYNC_OFFER,
//   (id, max = 0) => {
    // const isBuyEnabled = Session.get('isBuyEnabled');
    // const base = Session.get('baseCurrency');
    //
    // const clearLoadingIndicators = () => {
    //   Session.set('loading', false);
    //   Session.set('loadingBuyOFFERS', false);
    //   Session.set('loadingSellOFFERS', false);
    //   Session.set('loadingCounter', 0);
    //   Session.set('loadingProgress', 100);
    // };
    // Dapple['maker-otc'].objects.otc.offersReducer(id, (error, data) => {
    //   if (!error) {
    //     const idx = id.toString();
    //     const [sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress, owner, active] = data;
    //     const sellToken = Dapple.getTokenByAddress(sellWhichTokenAddress);
    //     if (sellToken === base && Session.get('loadingBuyOFFERS')) {
    //       Session.set('loadingBuyOFFERS', false);
    //     } else if (Session.get('loadingSellOFFERS')) {
    //       Session.set('loadingSellOFFERS', false);
    //     }
    //     if (active) {
    //       Offers.updateOffer(idx, sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress,
    //           owner, Status.CONFIRMED);
    //     } else {
    //       Offers.remove(idx);
    //       if (isBuyEnabled && Session.equals('selectedOffer', idx)) {
    //         $('#offerModal').modal('hide');
    //       }
    //     }
    //     Offers.syncedOffers.push(id);
    //     if (max > 0 && id > 1) {
    //       Session.set('loadingProgress', Math.round(100 * (Offers.syncedOffers.length / max)));
    //     } else {
    //       clearLoadingIndicators();
    //     }
    //   } else {
    //     clearLoadingIndicators();
    //   }
    // });
//   },
// );

// const UpdateOffer = createAction(
//   UPDATE_OFFER,
//   (idx, sellHowMuch, sellWhichTokenAddress, buyHowMuch,
//    buyWhichTokenAddress, owner, status) => {
    // const sellToken = Dapple.getTokenByAddress(sellWhichTokenAddress);
    // const buyToken = Dapple.getTokenByAddress(buyWhichTokenAddress);
    // const precision = Session.get('precision');
    //
    // if (sellToken && buyToken) {
    //   let sellHowMuchValue = convertTo18Precision(sellHowMuch, sellToken);
    //   let buyHowMuchValue = convertTo18Precision(buyHowMuch, buyToken);
    //   if (!(sellHowMuchValue instanceof BigNumber)) {
    //     sellHowMuchValue = new BigNumber(sellHowMuchValue, 10);
    //   }
    //   if (!(buyHowMuchValue instanceof BigNumber)) {
    //     buyHowMuchValue = new BigNumber(buyHowMuchValue, 10);
    //   }
    //
    //   const offer = {
    //     owner,
    //     status,
    //     helper: status === Status.PENDING ? 'Your new order is being placed...' : '',
    //     buyWhichTokenAddress,
    //     buyWhichToken: buyToken,
    //     sellWhichTokenAddress,
    //     sellWhichToken: sellToken,
    //     buyHowMuch: buyHowMuchValue.valueOf(),
    //     sellHowMuch: sellHowMuchValue.valueOf(),
    //     buyHowMuch_filter: buyHowMuchValue.toNumber(),
    //     sellHowMuch_filter: sellHowMuchValue.toNumber(),
    //     ask_price: buyHowMuchValue.div(sellHowMuchValue).valueOf(),
    //     bid_price: sellHowMuchValue.div(buyHowMuchValue).valueOf(),
    //     ask_price_sort: new BigNumber(buyHowMuchValue.div(sellHowMuchValue).toFixed(precision < 5 ? 5 : precision, 6), 10).toNumber(),
    //     bid_price_sort: new BigNumber(sellHowMuchValue.div(buyHowMuchValue).toFixed(precision < 5 ? 5 : precision, 6), 10).toNumber(),
    //   };
    //
    //   Offers.upsert(idx, { $set: offer });
    // }
//   },
// );

// const OfferContractParameters = createAction(
//   OFFER_CONTRACT_PARAMETERS,
//   (sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken) => {
    // const sellWhichTokenAddress = Dapple.getTokenAddress(sellWhichToken);
    // const buyWhichTokenAddress = Dapple.getTokenAddress(buyWhichToken);
    //
    // const sellHowMuchAbsolute = convertToTokenPrecision(sellHowMuch, sellWhichToken);
    // const buyHowMuchAbsolute = convertToTokenPrecision(buyHowMuch, buyWhichToken);
    //
    // // the ID of the offer that is the smallest in the set of offersReducer containing the offersReducer that are higher,
    // // than the offer to be created. If there are multiple offersReducer that satisfy the previous requirement
    // // than the one with the highest ID will be sent to the contract.
    // const higherOFFERSSorted = Offers.find({ buyWhichToken, sellWhichToken })
    // .fetch()
    // .filter((offer) => (offer._id.indexOf('0x') !== 0))
    // .filter((offer) => {
    //   const offerPrice = new BigNumber(`${offer.sellHowMuch}`).div(new BigNumber(`${offer.buyHowMuch}`));
    //   const specifiedPrice = new BigNumber(sellHowMuch.toString()).div(new BigNumber(buyHowMuch));
    //   return offerPrice.comparedTo(specifiedPrice) >= 0;
    // })
    // .sort((offer1, offer2) => {
    //   const buyHowMuch1 = new BigNumber(`${offer1.buyHowMuch}`);
    //   const buyHowMuch2 = new BigNumber(`${offer2.buyHowMuch}`);
    //   if (buyHowMuch1.comparedTo(buyHowMuch2) !== 0) return (buyHowMuch2.minus(buyHowMuch1).toNumber());
    //   return (offer1._id - offer2._id);
    // });
    // const userHigherId = ((higherOFFERSSorted.length > 0) ? higherOFFERSSorted[higherOFFERSSorted.length - 1]._id : 0);
    //
    // console.log(`Found ${higherOFFERSSorted.length} higher OFFERS: ${higherOFFERSSorted.map((it) => it._id)}`);
    // console.log(`user_higher_id is ${userHigherId}`);
    //
    // return { sellHowMuchAbsolute, sellWhichTokenAddress, buyHowMuchAbsolute, buyWhichTokenAddress, userHigherId };
  // },
// );

const cancelOffer = createAction(
  CANCEL_OFFER,
  (offerId) =>
    window.contracts.market.cancel(offerId, { gas: CANCEL_GAS }),
);
const cancelOfferEpic = (offer) => async (dispatch, getState) => {
  const cancelOfferAction = dispatch(cancelOffer(offer.id))
    .then(
      async () => {
        dispatch(
          transactions.actions.addTransactionEpic({
            type: TX_OFFER_CANCELLED,
            txSubjectId: offer.id,
            txHash: (await cancelOfferAction).value,
          }),
        );
      },
      () => {
        dispatch(
          transactions.actions.transactionRejected({
            txType: TX_OFFER_CANCELLED,
            txStatus: TX_STATUS_CANCELLED_BY_USER,
            txSubjectId: offer.id,
            txCancelBlock: network.latestBlockNumber(getState()),
          }),
        );
      },
    );
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
      dispatch(
        getTradingPairOfferCount(baseToken, quoteToken),
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
      dispatch(
        getTradingPairOfferCount(baseToken, quoteToken),
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
  while (offerCount.buyOfferCount) {
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
  while (offerCount.sellOfferCount) {
    dispatch(syncOffer(currentSellOfferId));
    currentSellOfferId = (await dispatch(getWorseOffer(currentSellOfferId))).value.toNumber();
    --offerCount.sellOfferCount;
    if (!offerCount.sellOfferCount) {
      dispatch(loadSellOffers.fulfilled(sellOffersTradingPair));
    }
  }
  return loadSellOffers;
};

const tradingPairOffersAlreadyLoaded = createAction(TRADING_PAIR_ALREADY_LOADED);
const syncOffers = createPromiseActions(SYNC_OFFERS);
const syncOffersEpic = ({ baseToken, quoteToken }) => async (dispatch, getState) => {

  if (offers.activeTradingPairOffersInitialLoadStatus(getState()) !== STATUS_PRISTINE) {
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
      if (sellHowMuchValue.toNumber() === 0) {
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
const subscribeNewOffersFilledInEpic = (fromBlock, filter = {}) => async (dispatch, getState) => {
  window.contracts.market.LogMake(filter, { fromBlock, toBlock: 'latest' })
    .then((err, LogMakeEvent) => {
      const newOfferId = parseInt(LogMakeEvent.args.id, 16);
      dispatch(
        newOfferFilledIn(newOfferId),
      );
      // dispatch(
      //   getTradingPairOfferCount(baseToken, quoteToken)
      // )
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
  OFFER_PARTIALLY_FILLED_IN,
  ({ offerId, baseToken, quoteToken, offerType, updatedOffer, previousOfferState }) =>
    ({ offerId, baseToken, quoteToken, offerType, updatedOffer, previousOfferState }),
);
const offerCompletelyFilledIn = createAction(
  OFFER_COMPLETELY_FILLED_IN,
  ({ offerId, baseToken, quoteToken, offerType, updatedOffer, previousOfferState }) =>
    ({ offerId, baseToken, quoteToken, offerType, updatedOffer, previousOfferState }),
);

const checkOfferIsActive = createAction(
  'OFFERS/CHECK_OFFER_IS_ACTIVE',
  offerId => window.contracts.market.isActive(offerId),
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
          console.log('LogItemUpdate', offerId, LogItemUpdateEvent, OFFER_SYNC_TYPE_UPDATE);
          dispatch(syncOffer(offerId, OFFER_SYNC_TYPE_UPDATE, offerSearchResult.offer));
        } else {
          console.log('LogItemUpdate', offerId, LogItemUpdateEvent, OFFER_SYNC_TYPE_NEW_OFFER);
          dispatch(syncOffer(offerId, OFFER_SYNC_TYPE_NEW_OFFER));
        }
      } // else offer is being cancelled ( handled in LogKill )

      // const { baseToken, quoteToken } = getOfferTradingPairAndType(offer,  getState());
      // dispatch(
      //   getTradingPairOfferCount(baseToken, quoteToken)
      // )
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
    initialSyncStatus: STATUS_PRISTINE,
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

const actions = {
  Init,
  initOffersEpic,
  // LogTakeToTrade,
  // GetBlockNumberOfTheMostRecentBlock,
  FetchTradesIssuedForAddress,
  FetchTradesAcceptedForAddress,
  ListenForTheNewSortedOffers,
  getTradingPairOfferCount,
  cancelOfferEpic,
  syncOffersEpic,
  subscribeOffersEventsEpic,
  checkOfferIsActive
};

const reducer = handleActions({
  [initOffers]: (state, { payload }) => {
    return state.updateIn(['offers'], () => payload).set('offersInitialized', () => true);
  },
  [syncOffers.pending]: (state, { payload }) =>
    state.updateIn(['offers', Map(payload), 'initialSyncStatus'], () => STATUS_PENDING),
  [syncOffers.fulfilled]: (state, { payload }) =>
    state.updateIn(['offers', Map(payload), 'initialSyncStatus'], () => STATUS_COMPLETED),
  [syncOffers.rejected]: (state, { payload }) =>
    state.updateIn(['offers', Map(payload), 'initialSyncStatus'], () => STATUS_ERROR),
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
}, initialState);

export default {
  actions,
  reducer,
};