import { createAction, handleActions } from 'redux-actions';
import { fromJS, List, Map } from 'immutable';

import { createPromiseActions } from '../../utils/createPromiseActions';
import * as BigNumber from 'bignumber.js';
import tokens from '../selectors/tokens';
import logTakeToTrade from '../../utils/trades/logTakeToTrade';
import { first } from 'lodash';
import { fulfilled } from '../../utils/store';
import { web3p } from '../../bootstrap/web3';

const initialState = fromJS({
  volumes: null,
  marketHistory: null,
  initialMarketHistoryLoaded: false,
  loadingTradeHistory: false,
  volumesLoaded: false,
  tradeHistoryStartingBlockTimestamp: null,
  latestEventsBlocks: {
    LogTake: null,
    LogMake: null,
    LogTrade: null,
  },
});

const INIT = 'TRADES/INIT';
const SYNC_TRADES = 'TRADES/SYNC_TRADES';
const INIT_VOLUMES = 'TRADES/INIT_VOLUMES';
const INIT_MARKET_HISTORY = 'TRADES/INIT_MARKET_HISTORY';
const INIT_TRADES_HISTORY = 'TRADES/INIT_TRADES_HISTORY';
const UPDATE_TOKEN_PAIR_VOLUME = 'TRADES/UPDATE_TOKEN_PAIR_VOLUME';

const SUBSCRIBE_LOG_TAKE_EVENTS = 'TRADES/SUBSCRIBE_LOG_TAKE_EVENTS';
const SUBSCRIBE_LOG_MAKE_EVENTS = 'TRADES/SUBSCRIBE_LOG_MAKE_EVENTS';
const SUBSCRIBE_LOG_TRADE_EVENTS = 'TRADES/SUBSCRIBE_LOG_TRADE_EVENTS';

const FETCH_LOG_TAKE_EVENTS = 'TRADES/FETCH_LOG_TAKE_EVENTS';
const FETCH_LOG_MAKE_EVENTS = 'TRADES/FETCH_LOG_MAKE_EVENTS';
const FETCH_LOG_TRADE_EVENTS = 'TRADES/FETCH_LOG_TRADE_EVENTS';

export const BID = 'TRADES/TRADE_TYPE_BID';
export const ASK = 'TRADES/TRADE_TYPE_ASK';



const GET_TRADE_HISTORY_BLOCK_STARTING_BLOCK_TIMESTAMP = 'TRADES/GET_TRADE_HISTORY_BLOCK_STARTING_BLOCK_TIMESTAMP';

const Init = createAction(
  INIT,
  () => null,
);

const initMarketHistoryAction = createAction(INIT_MARKET_HISTORY, imh => fromJS(imh));
const initMarketHistory = () => (dispatch) => {
  const initialMarketHistoryData = [];
  dispatch(
    initMarketHistoryAction(initialMarketHistoryData),
  );
};

const initTradesHistoryAction = createAction(INIT_TRADES_HISTORY, ith => fromJS(ith));
const initTradesHistory = () => (dispatch) => {
  const initialTradesData = [];
  dispatch(
    initTradesHistoryAction(initialTradesData),
  );
};

const initVolumesAction = createAction(INIT_VOLUMES, iv => fromJS(iv));
const initializeVolumes = () => (dispatch, getState) => {
  const initialVolumesData = {};
  tokens.tradingPairs(getState()).forEach(tp => initialVolumesData[`${tp.get('base')}/${tp.get('quote')}`] = {
    volume: 0,
    latestPrice: null,
  });
  dispatch(
    initVolumesAction(initialVolumesData),
  );
};

const logTradeEvent = createAction('TRADES/EVENT___LOG_TRADE', (logTrade) => {
  const eventData = logTrade.args;
  return logTrade;
});

const logTakeEvent = createAction('TRADES/EVENT___LOG_TAKE', (logTake) => {
  const eventData = logTake.args;
  return logTake;
});

const logMakeEvent = createAction('TRADES/EVENT___LOG_MAKE', (logMake) => {
  const eventData = logMake.args;
  return logMake;
});


const getTradeHistoryStartingBlockTimestamp = createAction(
  GET_TRADE_HISTORY_BLOCK_STARTING_BLOCK_TIMESTAMP, async blockNumber =>
    (await web3p.eth.getBlock(blockNumber)).timestamp
);

const loadInitialTradeHistory = createAction(
  'TRADES/LOAD_INITIAL_TRADE_HISTORY',
  takeEventsList => takeEventsList.map(logTakeToTrade),
);


const addTradeHistoryEntry = createAction(
  'TRADES/ADD_HISTORY_ENTRY',
  takeEvent => logTakeToTrade(takeEvent),
);

const loadingTradeHistory = createAction(
  'TRADES/LOADING_TRADE_HISTORY',
  loadingStatus => loadingStatus
);

const initialMarketHistoryLoaded = createAction(
  'TRADES/INITIAL_MARKET_HISTORY_LOADED',
);

const updateTradingPairVolume = createAction(
  UPDATE_TOKEN_PAIR_VOLUME,
  ({ tradingPair, takeAmount }) => ({ tradingPair, takeAmount }),
);

const fetchLogTakeEventsAction = createPromiseActions(FETCH_LOG_TAKE_EVENTS);
const fetchLogTakeEventsEpic = ({ fromBlock, toBlock }) => (dispatch) => {
  dispatch(fetchLogTakeEventsAction.pending());
  return new Promise((resolve, reject) => {
    dispatch(loadingTradeHistory(true));
    window.contracts.market.LogTake(
      {}, { fromBlock, toBlock })
      .get((err, logTakesList) => {
        if (err) {
          dispatch(fetchLogTakeEventsAction.rejected(err));
          reject(err);
          alert('err')
        }

        dispatch(loadingTradeHistory(false));
        const firstLogTake = first(logTakesList);
        if(firstLogTake) {
          dispatch(
            getTradeHistoryStartingBlockTimestamp(first(logTakesList).blockNumber)
          );
        }
        dispatch(loadInitialTradeHistory(logTakesList));
        resolve(toBlock);
      });
  });
};

const subscribeLogTakeEventsAction = createPromiseActions(SUBSCRIBE_LOG_TAKE_EVENTS);
const subscribeLogTakeEventsEpic = (fromBlock) => async (dispatch) => {
  dispatch(subscribeLogTakeEventsAction.pending());
  window.contracts.market.LogTake(
    {}, { fromBlock: fromBlock, toBlock: 'latest' },
  ).then((err, logTake) => {
    dispatch(addTradeHistoryEntry(logTake));
  });
  dispatch(subscribeLogTakeEventsAction.fulfilled());
};

const SyncTrades = createAction(
  SYNC_TRADES,
  (historicalTradesRange) => {
    // // Get all LogTake events in one go so we can fill up prices, volume and trade history
    // Dapple['maker-otc'].objects.otc.LogTake({}, {
    //   fromBlock: historicalTradesRange.startBlockNumber,
    //   toBlock: historicalTradesRange.endBlockNumber,
    // }).get((error, logTakes) => {
    //   if (!error) {
    //     for (let i = 0; i < logTakes.length; i++) {
    //       // Since we have the transactionHash the same for 2 LogTake events because two orders were filled automatically
    //       // We use each log event index to create unique ids for the log entry in the db.
    //       const eventLogIndex = logTakes[i].logIndex;
    //       const trade = logTakeToTrade(logTakes[i]);
    //       if (trade && (trade.timestamp * 1000 >= historicalTradesRange.startTimestamp)) {
    //         const uniqueId = trade.transactionHash + eventLogIndex;
    //         Trades.upsert(uniqueId, trade);
    //       }
    //     }
    //     Session.set('loadingTradeHistory', false);
    //   }
    // });
    //
    // // Watch LogTake events in realtime
    // Dapple['maker-otc'].objects.otc.LogTake({},
    //     { fromBlock: historicalTradesRange.endBlockNumber + 1 }, (error, logTake) => {
    //       if (!error) {
    //         const trade = logTakeToTrade(logTake);
    //         if (trade) {
    //           const uniqueId = trade.transactionHash + logTake.logIndex;
    //           Trades.upsert(uniqueId, trade);
    //         }
    //       }
    //     });
  },
);

const actions = {
  Init,
  SyncTrades,
  initializeVolumes,
  initMarketHistory,
  initTradesHistory,
  subscribeLogTakeEventsEpic,
  fetchLogTakeEventsEpic,
  initialMarketHistoryLoaded,
};

const reducer = handleActions({
  [initVolumesAction]: (state, { payload }) => state.set('volumes', payload),
  [initTradesHistoryAction]: (state, { payload }) => state.set('trades', payload),
  [updateTradingPairVolume]:
    (state, { payload: { tradingPair, takeAmount, latestPrice } }) =>
      state
        .updateIn(
          ['volumes', tradingPair, 'volume'],
          (currentVolume) =>
            new BigNumber(currentVolume).add(new BigNumber(takeAmount)),
        )
        .setIn(['volumes', tradingPair, 'latestPrice'], latestPrice),
  [logTakeEvent]: (state, { payload }) => state.setIn(['latestEventsBlocks', 'LogTake'], payload.blockNumber),
  [loadInitialTradeHistory]: (state, { payload }) => state.updateIn(['marketHistory'], () => List(payload)),
  [addTradeHistoryEntry]: (state, { payload }) =>
    state.updateIn(
      ['marketHistory'], marketHistory => marketHistory.push(payload)
    ),
  [initialMarketHistoryLoaded]: (state) => state.set('initialMarketHistoryLoaded', true),
  [fulfilled(getTradeHistoryStartingBlockTimestamp)]:
    (state, { payload }) => state.set('tradeHistoryStartingBlockTimestamp', payload)
}, initialState);

export default {
  actions,
  reducer,
};
