import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import BigNumber from 'bignumber.js';

import { fulfilled, pending, rejected } from '../../utils/store';
import { createPromiseActions } from '../../utils/createPromiseActions';
import tokens from '../selectors/tokens';
import getTokenByAddress from '../../utils/tokens/getTokenByAddress';
import { web3p } from '../../bootstrap/web3';
import { convertTo18Precision } from '../../utils/conversion';


const TYPE_BUY_OFFER = 'OFFERS/TYPE_BUY';
const TYPE_SELL_OFFER = 'OFFERS/TYPE_SELL';

const SYNC_STATUS_PENDING = 'OFFERS/SYNC_STATUS_PENDING';
const SYNC_STATUS_COMPLETED = 'OFFERS/SYNC_STATUS_PENDING';
const SYNC_STATUS_ERROR = 'OFFERS/SYNC_STATUS_ERROR';

const initialState = Immutable.fromJS({
  offers: {},
  loadingOffers: null,
  initialSyncStatus: null,
  loadingSellOffers: null,
  loadingBuyOffers: null,
});

// {
//   lastSyncAt: null,
//   buyOfferCount: null,
//   sellOfferCount: null,
//   buyOffers: [],
//   sellOffers: []
// }

const INIT = 'OFFERS/INIT';
const LOG_TAKE_TO_TRADE = 'OFFERS/LOG_TAKE_TO_TRADE';
const GET_LATEST_BLOCK_NUMBER = 'OFFERS/GET_LATEST_BLOCK_NUMBER';
const FETCH_TRADES_ISSUED_FOR_ADDRESS = 'OFFERS/FETCH_TRADES_ISSUED_FOR_ADDRESS';
const FETCH_TRADES_ACCEPTED_FOR_ADDRESS = 'OFFERS/FETCH_TRADES_ACCEPTED_FOR_ADDRESS';
const LISTEN_FOR_NEW_TRADES_OF_ADDRESS = 'OFFERS/LISTEN_FOR_NEW_TRADES_OF_ADDRESS';
const LISTEN_FOR_ACCEPTED_TRADES_OF_ADDRESS = 'OFFERS/LISTEN_FOR_ACCEPTED_TRADES_OF_ADDRESS';
const LISTEN_FOR_THE_NEW_SORTED_OFFERS = 'OFFERS/LISTEN_FOR_THE_NEW_SORTED_OFFERS';
const CHECK_MARKET_OPEN = 'OFFERS/CHECK_MARKET_OPEN';
const GET_HISTORICAL_TRADE_RANGE = 'OFFERS/GET_HISTORICAL_TRADE_RANGE';
const SYNC_OFFERS = 'OFFERS/SYNC_OFFERS';
const SYNC_OFFERS_AND_TRADES = 'OFFERS/SYNC_OFFERS_AND_TRADES';
const GET_BEST_OFFER = 'OFFERS/GET_BEST_OFFER';
const GET_HIGHER_OFFER_ID = 'OFFERS/GET_HIGHER_OFFER_ID';
const SYNC_OFFER = 'OFFERS/SYNC_OFFER';
const UPDATE_OFFER = 'OFFERS/UPDATE_OFFER';
const OFFER_CONTRACT_PARAMETERS = 'OFFERS/OFFER_CONTRACT_PARAMETERS';
const NEW_OFFER_GAS_ESTIMATE = 'OFFERS/NEW_OFFER_GAS_ESTIMATE';
const FILL_OFFER_GAS_ESTIMATE = 'OFFERS/FILL_OFFER_GAS_ESTIMATE';
const NEW_OFFER = 'OFFERS/NEW_OFFER';
const BUY_OFFER = 'OFFERS/BUY_OFFER';
const CANCEL_OFFER = 'OFFERS/CANCEL_OFFER';

const GET_LAST_OFFER_ID = 'ORDERS/GET_LAST_OFFER_ID';

const Status = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  BOUGHT: 'bought',
  OPEN: 'open',
  CLOSED: 'closed',
};

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

const ListenForNewTradesOfAddress = createAction(
  LISTEN_FOR_NEW_TRADES_OF_ADDRESS,
  address => {
    // getBlockNumberOfTheMostRecentBlock().then((latestBlock) => {
    //   Dapple['maker-otc'].objects.otc.LogTake({ maker: address },
    //       { fromBlock: latestBlock + 1 }, (error, logTake) => {
    //         if (!error) {
    //           const trade = logTakeToTrade(logTake);
    //
    //           if (trade) {
    //             IndividualTrades.upsert(trade.transactionHash, trade);
    //           }
    //         }
    //       });
    // });
  },
);

const ListenForAcceptedTradesOfAddress = createAction(
  LISTEN_FOR_ACCEPTED_TRADES_OF_ADDRESS,
  address => {
    // getBlockNumberOfTheMostRecentBlock().then((latestBlock) => {
    //   Dapple['maker-otc'].objects.otc.LogTake({ taker: address },
    //       { fromBlock: latestBlock + 1 }, (error, logTake) => {
    //         if (!error) {
    //           if (logTake.args.maker !== logTake.args.taker) {
    //             const trade = logTakeToTrade(logTake);
    //
    //             if (trade) {
    //               IndividualTrades.upsert(trade.transactionHash, trade);
    //             }
    //           }
    //         }
    //       });
    // });
  },
);

const ListenForTheNewSortedOffers = createAction(
  LISTEN_FOR_THE_NEW_SORTED_OFFERS,
  () => web3p.eth.filter(window.contracts.market.LogSortedOffer),
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
const CheckMarketOpen = createAction(
  CHECK_MARKET_OPEN,
  () => {
    // Fetch the market close time
    // Dapple['maker-otc'].objects.otc.close_time((error, t) => {
    //   if (!error) {
    //     const closeTime = t.toNumber();
    //     Session.set('close_time', closeTime);
    //   }
    // });
    // Dapple['maker-otc'].objects.otc.isClosed((error, t) => {
    //   if (!error) {
    //     Session.set('market_open', !t);
    //   }
    // });
  },
);

const GetHistoricalTradesRange = createAction(
  GET_HISTORICAL_TRADE_RANGE,
  (numberOfPreviousDays) => {
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
  },
);

const resetOffers = createAction(
  'OFFERS/RESET_OFFERS',
  ({ baseToken, quoteToken }) => ({ baseToken, quoteToken }),
);

const SyncOffers = createAction(
  SYNC_OFFERS,
  () => {
    //   Offers.remove({});
    //   Session.set('loadingCounter', 0);
    //   Session.set('offersCount', 0);
    //
    //   // Watch ItemUpdate Event
    //   /* eslint new-cap: ["error", { "capIsNewExceptions": ["ItemUpdate", "Trade", "LogTake"] }] */
    //
    //   function cartesianProduct(arr) {
    //     return arr.reduce((a, b) => a.map((x) => b.map((y) => x.concat(y))).reduce((a, b) => a.concat(b), []), [[]]);
    //   }
    //
    //   function flatten(ary) {
    //     return ary.reduce((a, b) => {
    //       if (Array.isArray(b)) {
    //         return a.concat(flatten(b));
    //       }
    //       return a.concat(b);
    //     }, []);
    //   }
    //

    // const getNextOffer = (id, error) => {
    //   if (!error) {
    //     // const loaded = Session.get('loadingCounter') + 1;
    //     // const total = Session.get('offersCount');
    //     // Session.set('loadingCounter', loaded);
    //
    //     if (loaded === total) {
    //       Offers.syncOffer(id.toString(10));
    //     } else {
    //       Offers.syncOffer(id.toString(10), total);
    //     }
    //     Dapple['maker-otc'].objects.otc.getWorseOffer(id.toString(10), (err, nextId) => {
    //       if (!err && !nextId.eq(0)) {
    //         getNextOffer(nextId);
    //       }
    //     });
    //   } else {
    //     console.debug('Trouble getting next offer: ', error);
    //   }
    // };
    //
    //   const getOffersCount = (quote, base) => {
    //     const quoteAddress = Dapple.getTokenAddress(quote);
    //     const baseAddress = Dapple.getTokenAddress(base);
    //
    //     function requestOffersFor(firstCurrency, secondCurrency) {
    //       return new Promise((resolve, reject) => {
    //         Dapple['maker-otc'].objects.otc.getOfferCount(firstCurrency, secondCurrency, (err, count) => {
    //           if (!err) {
    //             resolve(count);
    //           } else {
    //             reject(err);
    //           }
    //         });
    //       });
    //     }
    //
    //     const bidOffersRequest = requestOffersFor(quoteAddress, baseAddress);
    //     const askOffersRequest = requestOffersFor(baseAddress, quoteAddress);
    //
    //     return Promise.all([bidOffersRequest, askOffersRequest]);
    //   };
    //
    //   const isMatchingEnabled = Session.get('isMatchingEnabled');
    //
    //   Session.set('loadingBuyOFFERS', true);
    //   Session.set('loadingSellOFFERS', true);
    //
    //   if (isMatchingEnabled) {
    //     Session.set('loading', true);
    //     Session.set('loadingProgress', 0);
    //     Offers.syncedOffers = [];
    //     const quoteToken = Session.get('quoteCurrency');
    //     const baseToken = Session.get('baseCurrency');
    //     getOffersCount(quoteToken, baseToken).then((count) => {
    //       Session.set('offersCount', parseInt(count[0], 10) + parseInt(count[1], 10)); // combining both ask and bid offers for a given pair
    //       Offers.getBestOffer(quoteToken, baseToken).then(getNextOffer);
    //       Offers.getBestOffer(baseToken, quoteToken).then(getNextOffer);
    //     });
    //
    //     listenForNewSortedOFFERS();
    //     listenForFilledOrCancelledOFFERS();
    //   } else {
    //     Dapple['maker-otc'].objects.otc.LogItemUpdate((err, result) => {
    //       if (!err) {
    //         const id = result.args.id.toNumber();
    //         Offers.syncOffer(id);
    //         Offers.remove(result.transactionHash);
    //         if (Session.equals('selectedOffer', result.transactionHash)) {
    //           Session.set('selectedOffer', id.toString());
    //         }
    //       }
    //     });
    //
    //     Dapple['maker-otc'].objects.otc.last_offer_id((err, n) => {
    //       if (!err) {
    //         const lastOfferId = n.toNumber();
    //         console.log('last_offer_id', lastOfferId);
    //         if (lastOfferId > 0) {
    //           Session.set('loading', true);
    //           Session.set('loadingProgress', 0);
    //           for (let i = lastOfferId; i >= 1; i--) {
    //             Offers.syncOffer(i, lastOfferId);
    //           }
    //         } else {
    //           Session.set('loading', false);
    //           Session.set('loadingProgress', 100);
    //           Session.set('loadingBuyOFFERS', false);
    //           Session.set('loadingSellOFFERS', false);
    //         }
    //       }
    //     });
    //   }
  },
);

const SyncOffersAndTrades = createAction(
  SYNC_OFFERS_AND_TRADES,
  () => {
    // Offers.checkMarketOpen();
    // Offers.syncOffers();
    // // As it is expensive to load historical Trades, we load them only for the last week
    // // Enough for the Volume chart and the Market History section
    // Offers.getHistoricalTradesRange(6).then(Offers.syncTrades);
  },
);

const subscribeNewOffers = () => {
};

const subscribeFilledOrCancelledOffers = () => {
};

const getBestOffer = createAction(
  GET_BEST_OFFER,
  async (sellToken, buyToken) => {
    const sellTokenAddress = window.contracts.tokens[sellToken].address;
    const buyTokenAddress = window.contracts.tokens[buyToken].address;
    return window.contracts.market.getBestOffer(sellTokenAddress, buyTokenAddress);
    // return new Promise((resolve, reject) => {
    //   Dapple['maker-otc'].objects.otc.getBestOffer(sellTokenAddress, buyTokenAddress, (error, id) => {
    //     if (!error) {
    //       resolve(id);
    //     } else {
    //       reject(error);
    //     }
    //   });
    // });
  },
);

const GetHigherOfferId = createAction(
  GET_HIGHER_OFFER_ID,
  function getHigherOfferId(existingId) {
    return new Promise((resolve, reject) => {
      // Dapple['maker-otc'].objects.otc.getHigherOfferId(
      //     existingId,
      //     (error, id) => {
      //       if (!error) {
      //         resolve(id);
      //       } else {
      //         reject(error);
      //       }
      //     },
      // );
    });
  },
);

const SyncOffer = createAction(
  SYNC_OFFER,
  (id, max = 0) => {
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
    // Dapple['maker-otc'].objects.otc.offers(id, (error, data) => {
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
  },
);

const UpdateOffer = createAction(
  UPDATE_OFFER,
  (idx, sellHowMuch, sellWhichTokenAddress, buyHowMuch,
   buyWhichTokenAddress, owner, status,) => {
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
  },
);

const OfferContractParameters = createAction(
  OFFER_CONTRACT_PARAMETERS,
  (sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken) => {
    // const sellWhichTokenAddress = Dapple.getTokenAddress(sellWhichToken);
    // const buyWhichTokenAddress = Dapple.getTokenAddress(buyWhichToken);
    //
    // const sellHowMuchAbsolute = convertToTokenPrecision(sellHowMuch, sellWhichToken);
    // const buyHowMuchAbsolute = convertToTokenPrecision(buyHowMuch, buyWhichToken);
    //
    // // the ID of the offer that is the smallest in the set of offers containing the offers that are higher,
    // // than the offer to be created. If there are multiple offers that satisfy the previous requirement
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
  },
);

const NewOfferGasEstimate = createAction(
  NEW_OFFER_GAS_ESTIMATE,
  async (sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken) => {
    // const { sellHowMuchAbsolute, sellWhichTokenAddress, buyHowMuchAbsolute, buyWhichTokenAddress, userHigherId } =
    //     Offers.offerContractParameters(sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken);
    //
    // const data = Dapple['maker-otc'].objects.otc.offer['uint256,address,uint256,address,uint256,bool'].getData(sellHowMuchAbsolute, sellWhichTokenAddress,
    //     buyHowMuchAbsolute, buyWhichTokenAddress, userHigherId, true);
    //
    // const latestBlockPromise = Offers.getBlock('latest');
    // const estimateGasPromise = new Promise((resolve, reject) => {
    //   web3Obj.eth.estimateGas({ to: Dapple['maker-otc'].environments[Dapple.env].otc.value, data }, (error, result) => {
    //     if (!error) {
    //       resolve(result);
    //     } else {
    //       reject(error);
    //     }
    //   });
    // });
    //
    // return Promise.all([estimateGasPromise, latestBlockPromise]).then((results) => [results[0], results[1].gasLimit]);
  },
);

const FillOfferGasEstimate = createAction(
  FILL_OFFER_GAS_ESTIMATE,
  (id, quantity) => {
    // const data = Dapple['maker-otc'].objects.otc.buy.getData(id, quantity);
    //
    // const latestBlock = Offers.getBlock('latest');
    // const estimation = new Promise((resolve, reject) => {
    //   web3Obj.eth.estimateGas({ to: Dapple['maker-otc'].environments[Dapple.env].otc.value, data }, (error, result) => {
    //     if (!error) {
    //       resolve(result);
    //     } else {
    //       console.log(error);
    //       reject(error);
    //     }
    //   });
    // });
    //
    // return Promise.all([estimation, latestBlock]).then((results) =>
    //     ({ quantity: results[0], limit: results[1].gasLimit }),
    // );
  },
);

const NewOffer = createAction(
  NEW_OFFER,
  (sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken, callback) => {
    // // Offers.newOfferGasEstimate(sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken)
    // // .then((gasEstimate) => {
    // //   const { sellHowMuchAbsolute, sellWhichTokenAddress, buyHowMuchAbsolute, buyWhichTokenAddress, userHigherId } =
    // //       Offers.offerContractParameters(sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken);
    // //   Dapple['maker-otc'].objects.otc.offer['uint256,address,uint256,address,uint256,bool'](sellHowMuchAbsolute, sellWhichTokenAddress,
    // //       buyHowMuchAbsolute, buyWhichTokenAddress, userHigherId, true,
    // //       { gas: Math.min(gasEstimate[0] + 500000, gasEstimate[1]) }, (error, tx) => {
    // //         callback(error, tx);
    // //         if (!error) {
    // //           Offers.updateOffer(tx, sellHowMuchAbsolute, sellWhichTokenAddress, buyHowMuchAbsolute, buyWhichTokenAddress,
    // //               web3Obj.eth.defaultAccount, Status.PENDING);
    // //           Transactions.add('offer', tx, { id: tx, status: Status.PENDING });
    // //         }
    // //       });
    // })
    // .catch((error) => callback(error));
  },
);

const BuyOffer = createAction(
  BUY_OFFER,
  (_id, type, _quantity, _token) => {
    // const quantityAbsolute = convertToTokenPrecision(_quantity, _token);
    //
    // Offers.fillOfferGasEstimate(_id, quantityAbsolute).then((estimated) => {
    //   Offers.update(_id, { $unset: { helper: '' } });
    //   const estimatedGas = Math.min(estimated.quantity + 500000, estimated.limit);
    //   Dapple['maker-otc'].objects.otc.buy(_id, quantityAbsolute, { gas: estimatedGas }, (error, tx) => {
    //     if (!error) {
    //       Transactions.add('offer', tx, { id: _id, status: Status.BOUGHT });
    //       Offers.update(_id, {
    //         $set: {
    //           tx, status: Status.BOUGHT, helper: `Your ${type} order is being processed...`,
    //         },
    //       });
    //     } else {
    //       Offers.update(_id, { $set: { helper: formatError(error) } });
    //     }
    //   });
    // });
  },
);

const cancelOffer = createAction(
  CANCEL_OFFER,
  (idx) => {
    const id = parseInt(idx, 10);
    // Offers.update(idx, { $unset: { helper: '' } });
    // Dapple['maker-otc'].objects.otc.cancel(id, { gas: CANCEL_GAS }, (error, tx) => {
    //   if (!error) {
    //     Transactions.add('offer', tx, { id: idx, status: Status.CANCELLED });
    //     Offers.update(idx, { $set: { tx, status: Status.CANCELLED, helper: 'The order is being cancelled...' } });
    //   } else {
    //     Offers.update(idx, { $set: { helper: formatError(error) } });
    //   }
    // });
  },
);

const getWorseOffer = createAction(
  'OFFERS/GET_WORSE_OFFER',
  offerId => window.contracts.market.getWorseOffer(offerId),
);

const getNextOffer = (id, error) => {
  // if (!error) {
  //   // const loaded = Session.get('loadingCounter') + 1;
  //   // const total = Session.get('offersCount');
  //   // Session.set('loadingCounter', loaded);
  //
  //   if (loaded === total) {
  //     Offers.syncOffer(id.toString(10));
  //   } else {
  //     Offers.syncOffer(id.toString(10), total);
  //   }
  //   Dapple['maker-otc'].objects.otc.getWorseOffer(id.toString(10), (err, nextId) => {
  //     if (!err && !nextId.eq(0)) {
  //       getNextOffer(nextId);
  //     }
  //   });
  // } else {
  //   console.debug('Trouble getting next offer: ', error);
  // }
};

const loadOffer = createAction(
  'OFFERS/LOAD_OFFER',
  async (offerId) => window.contracts.market.offers(offerId),
);

const syncOffer = (offerId, offerType) => async (dispatch, getState) => {
  // const isBuyEnabled = Session.get('isBuyEnabled');
  const { baseToken } = tokens.activeTradingPair(getState());
  // const base = Session.get('baseCurrency');
  //
  // const clearLoadingIndicators = () => {
  //   Session.set('loading', false);
  //   Session.set('loadingBuyOrders', false);
  //   Session.set('loadingSellOrders', false);
  //   Session.set('loadingCounter', 0);
  //   Session.set('loadingProgress', 100);
  // };

  const offer = (await dispatch(loadOffer(offerId))).value;

  const idx = offerId.toString();
  const [
    sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress, owner, timestamp
  ] = offer;
  dispatch(
    updateOfferEpic({
      idx, sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress, owner, timestamp, offerType
    })
  )
  // const sellToken = getTokenByAddress(sellWhichTokenAddress);
  // if (sellToken === baseToken && Session.get('loadingBuyOrders')) {
  //   // Session.set('loadingBuyOrders', false);
  // } else if (Session.get('loadingSellOrders')) {
  //   // Session.set('loadingSellOrders', false);
  // }
  // if (timestamp.valueOf() > 0) {
  //   Offers.updateOffer(idx, sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress,
  //     owner, Status.CONFIRMED);
  // } else {
  //   Offers.remove(idx);
  //   if (isBuyEnabled && Session.equals('selectedOffer', idx)) {
  //     $('#offerModal').modal('hide');
  //   }
  // }
  // Offers.syncedOffers.push(offerId);
  // if (max > 0 && offerId > 1) {
  //   Session.set('loadingProgress', Math.round(100 * (Offers.syncedOffers.length / max)));
  // } else {
  //   clearLoadingIndicators();
  // }
  // } else {
  //   clearLoadingIndicators();
  // Dapple['maker-otc'].objects.otc.offers(offerId, (error, data) => {});
};

const loadBuyOffers = createPromiseActions('OFFERS/LOAD_BUY_OFFERS');
const loadBuyOffersEpic = (offerCount, payToken, getToken) => async (dispatch) => {
  let currentBuyOfferId = (await dispatch(getBestOffer(getToken, payToken))).value.toNumber();
  dispatch(loadBuyOffers.pending());
  while (offerCount.buyOfferCount) {
    dispatch(syncOffer(currentBuyOfferId, TYPE_BUY_OFFER));
    currentBuyOfferId = (await dispatch(getWorseOffer(currentBuyOfferId))).value.toNumber();
    --offerCount.buyOfferCount;
    if(!offerCount.buyOfferCount) {
      dispatch(loadBuyOffers.fulfilled());
    }
  }
  return loadBuyOffers;
};
const loadSellOffers = createPromiseActions('OFFERS/LOAD_SELL_OFFERS');
const loadSellOffersEpic = (offerCount, sellToken, getToken) => async (dispatch) => {
  let currentSellOfferId = (await dispatch(getBestOffer(sellToken, getToken))).value.toNumber();
  while (offerCount.sellOfferCount) {
    dispatch(syncOffer(currentSellOfferId, TYPE_SELL_OFFER));
    currentSellOfferId = (await dispatch(getWorseOffer(currentSellOfferId))).value.toNumber();
    --offerCount.sellOfferCount;
    if(!offerCount.sellOfferCount) {
      dispatch(loadSellOffers.fulfilled());
    }
  }
  return loadSellOffers;
};

const syncOffers = createPromiseActions(SYNC_OFFERS);
const syncOffersEpic = () => async (dispatch, getState) => {
  const { baseToken, quoteToken } = tokens.activeTradingPair(getState());
    dispatch(syncOffers.pending());
    dispatch(resetOffers({ baseToken, quoteToken }));
    const offerCount = (await dispatch(getTradingPairOfferCount(baseToken, quoteToken))).value;
    Promise.all([
      dispatch(loadBuyOffersEpic(offerCount, baseToken, quoteToken)).catch(
        e => dispatch(loadBuyOffers.rejected(e))
      ),
      dispatch(loadSellOffersEpic(offerCount, baseToken, quoteToken)).catch(
        e => dispatch(loadSellOffers.rejected(e))
      )
    ]).then(() => dispatch(syncOffers.fulfilled()));
};

const setOffer = createAction(
  'OFFERS/SET_OFFER',
  ({ offer, baseToken, quoteToken, offerType }) => ({ offer, baseToken, quoteToken, offerType })
);
const updateOfferEpic = ({
   idx = null,
   sellHowMuch,
   sellWhichTokenAddress,
   buyHowMuch,
   buyWhichTokenAddress,
   owner,
   status,
   offerType
}) => async (dispatch, getState) => {

  const sellToken = getTokenByAddress(sellWhichTokenAddress);
  const buyToken = getTokenByAddress(buyWhichTokenAddress);

  if( !sellToken  || !buyToken)  { return; }

  const precision = tokens.precision(getState());
  const { baseToken, quoteToken } = tokens.activeTradingPair(getState());

  let sellHowMuchValue = convertTo18Precision(sellHowMuch, sellToken);
  let buyHowMuchValue = convertTo18Precision(buyHowMuch, buyToken);
  if (!(sellHowMuchValue instanceof BigNumber)) { sellHowMuchValue = new BigNumber(sellHowMuchValue, 10); }
  if (!(buyHowMuchValue instanceof BigNumber)) { buyHowMuchValue = new BigNumber(buyHowMuchValue, 10); }

  const offer = {
    owner,
    status,
    helper: status === Status.PENDING ? 'Your new order is being placed...' : '',
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
      buyHowMuchValue.div(sellHowMuchValue).toFixed(precision < 5 ? 5 : precision, 6), 10
    ).toNumber(),
    bid_price_sort: new BigNumber(
      sellHowMuchValue.div(buyHowMuchValue).toFixed(precision < 5 ? 5 : precision, 6), 10
    ).toNumber(),
  };
  dispatch(setOffer({ offer, baseToken, quoteToken, offerType }));
  // Offers.upsert(idx, { $set: offer });
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

  // function requestOffersFor(firstCurrency, secondCurrency) {
  //   return new Promise((resolve, reject) => {
  //     Dapple['maker-otc'].objects.otc.getOfferCount(firstCurrency, secondCurrency, (err, count) => {
  //       if (!err) {
  //         resolve(count);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   });
  // }

);

const actions = {
  Init,
  // LogTakeToTrade,
  // GetBlockNumberOfTheMostRecentBlock,
  FetchTradesIssuedForAddress,
  FetchTradesAcceptedForAddress,
  ListenForNewTradesOfAddress,
  ListenForAcceptedTradesOfAddress,
  ListenForTheNewSortedOffers,
  getTradingPairOfferCount,
  syncOffersEpic,
};

const reducer = handleActions({
  [fulfilled(getTradingPairOfferCount)]:
    (state, { payload: { baseToken, quoteToken, buyOfferCount, sellOfferCount } }) => {
      return state.setIn(
        ['offers', Immutable.Map({ baseToken, quoteToken })],
        Immutable.Map(({ buyOfferCount, sellOfferCount, buyOffers: Immutable.List(), sellOffers: Immutable.List() })),
      );
    },
  [fulfilled(loadOffer)]:
    (state,
       // { payload: [sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress, owner, timestamp] }
     ) => state,
  [setOffer]: (state, { payload : { offer, baseToken, quoteToken, offerType } }) =>
    state.updateIn(
      ['offers', Immutable.Map({baseToken, quoteToken})], tradingPairOffers => {
        switch (offerType) {
          case TYPE_BUY_OFFER :
            return tradingPairOffers.updateIn(['buyOffers'], buyOffers => buyOffers.push(offer));
          case TYPE_SELL_OFFER:
            return tradingPairOffers.updateIn(['sellOffers'], sellOffers => sellOffers.push(offer));
        }
      }
    ),
  [pending(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_PENDING),
  [fulfilled(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_COMPLETED),
  [rejected(syncOffers)]: state => state.set('initialSyncStatus', SYNC_STATUS_ERROR),
  
  [pending(loadBuyOffers)]: state => state.set('loadingBuyOffers', SYNC_STATUS_PENDING),
  [fulfilled(loadBuyOffers)]: state => state.set('loadingBuyOffers', SYNC_STATUS_COMPLETED),
  [rejected(loadBuyOffers)]: state => state.set('loadingBuyOffers', SYNC_STATUS_ERROR),

  [pending(loadSellOffers)]: state => state.set('loadingSellOffers', SYNC_STATUS_PENDING),
  [fulfilled(loadSellOffers)]: state => state.set('loadingSellOffers', SYNC_STATUS_COMPLETED),
  [rejected(loadSellOffers)]: state => state.set('loadingSellOffers', SYNC_STATUS_ERROR),
}, initialState);

export default {
  actions,
  reducer,
};