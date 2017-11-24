import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({});

const INIT = 'TRADES/INIT';
const SYNC_TRADES = 'TRADES/SYNC_TRADES';

const Init = createAction(
  INIT,
  () => null,
);

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
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
