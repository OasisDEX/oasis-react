import { createAction, handleActions } from 'redux-actions';
import Immutable                       from 'immutable';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({});

const INIT = 'TOKEN_EVENTS/INIT';
const SET_EVENT_LOADING_INDICATOR_STATUS =
    'TOKEN_EVENTS/SET_EVENT_LOADING_INDICATOR_STATUS';
const PREPARE_ROW = 'TOKEN_EVENTS/PREPARE_ROW';
const SYNC_EVENT = 'TOKEN_EVENTS/SYNC_EVENT';
const SYNC_EVENTS = 'TOKEN_EVENTS/SYNC_EVENTS';
const SYNC_TIMESTAMPS = 'TOKEN_EVENTS/SYNC_TIMESTAMPS';
const WATCH_EVENTS = 'TOKEN_EVENTS/WATCH_EVENTS';
const WATCH_TOKEN_EVENTS = 'TOKEN_EVENTS/WATCH_TOKEN_EVENTS';
const PREPARE_ROW_GNT = 'TOKEN_EVENTS/PREPARE_ROW_GNT';
const WATCH_GNT_TOKEN_EVENTS = 'TOKEN_EVENTS/WATCH_GNT_TOKEN_EVENTS';

const Init = createAction(
    INIT,
    () => null,
);

const SetEventLoadingIndicatorStatus = createAction(
    SET_EVENT_LOADING_INDICATOR_STATUS,
    (txhash, status) => {
      // const currentlyLoading = Session.get('loadingTokenEvents') || {};
      // currentlyLoading[txhash] = status;
      // Session.set('loadingTokenEvents', currentlyLoading);
    },
);

const PrepareRow = createAction(
    PREPARE_ROW,
    (tokenId, event) => {
      // const row = {
      //   blockNumber: event.blockNumber,
      //   transactionHash: event.transactionHash,
      //   timestamp: null,
      //   token: tokenId,
      //   type: event.event.toLowerCase(),
      // };
      // // Handle different kinds of contract events
      // switch (row.type) {
      //   case 'transfer':
      //     row.from = event.args.from;
      //     row.to = event.args.to;
      //     row.amount = convertTo18Precision(event.args.value, Dapple.getTokenByAddress(event.address));
      //     break;
      //   case 'deposit':
      //     row.from = event.args.who;
      //     row.to = event.address;
      //     row.amount = convertTo18Precision(event.args.amount, Dapple.getTokenByAddress(event.address));
      //     break;
      //   case 'withdrawal':
      //     row.from = event.address;
      //     row.to = event.args.who;
      //     row.amount = convertTo18Precision(event.args.amount, Dapple.getTokenByAddress(event.address));
      //     break;
      //   default:
      //     break;
      // }
      // // Convert amount to string for storage
      // if (typeof (row.amount) !== 'undefined') {
      //   row.amount = row.amount.toString(10);
      // }
      //
      // return row;
    },
);

const SyncEvent = createAction(
    SYNC_EVENT,
    (tokenId, event) => {
      // const row = this.prepareRow(tokenId, event);
      // super.insert(row);
    },
);

const SyncEvents = createAction(
    SYNC_EVENTS,
    (tokenId, events) => {
      // const rows = [];
      // for (let i = 0; i < events.length; i++) {
      //   rows[i] = this.prepareRow(tokenId, events[i]);
      // }
      // super.batchInsert(rows, () => {});
    },
);

const SyncTimestamps = createAction(
    SYNC_TIMESTAMPS,
    () => {
      // const open = super.find({timestamp: null}).fetch();
      // // Sync all open transactions non-blocking and asynchronously
      // const syncTs = (index) => {
      //   // console.log('syncing ts', index);
      //   if (index >= 0 && index < open.length) {
      //     web3Obj.eth.getBlock(open[index].blockNumber, (error, result) => {
      //       if (!error) {
      //         // console.log('update', open[index].blockNumber, result.timestamp);
      //         super.update({blockNumber: open[index].blockNumber},
      //             {$set: {timestamp: result.timestamp}}, {multi: true});
      //         this.setEventLoadingIndicatorStatus(open[index].transactionHash,
      //             false);
      //       }
      //       syncTs(index + 1);
      //     });
      //   }
      // };
      // syncTs(0);
    },
);

const WatchEvents = createAction(
    WATCH_EVENTS,
    () => {
      // if (Session.get('AVGBlocksPerDay') && !Session.get('watchedEvents')) {
      //   Session.set('watchedEvents', true);
      //   const self = this;
      //   self.getLatestBlock().then((block) => {
      //     self.watchTokenEvents(block.number);
      //     self.watchGNTTokenEvents(block.number);
      //   });
      // }
    },
);

const WatchTokenEvents = createAction(
    WATCH_TOKEN_EVENTS,
    (latestBlock) => {
      // console.log('filtering token events from ', Session.get('startBlock'));
      // const ALL_TOKENS = Dapple.getTokens();
      // ALL_TOKENS.forEach((tokenId) => {
      //   Dapple.getToken(tokenId, (error, token) => {
      //     // console.log(tokenId);
      //     if (!error) {
      //       const address = Session.get('address');
      //       const self = this;
      //       // TODO: extract duplicated logic for every event in separate abstraction layer
      //       token.Transfer({from: address}, {
      //         fromBlock: latestBlock - (Session.get('AVGBlocksPerDay') * 7), // Last 7 days
      //       }).get((err, result) => {
      //         if (!err) {
      //           self.syncEvents(tokenId, result);
      //           result.forEach((transferEvent) => {
      //             this.setEventLoadingIndicatorStatus(
      //                 transferEvent.transactionHash, true);
      //           });
      //           Session.set('loadingTransferHistory', false);
      //         }
      //         token.Transfer({from: address}, {fromBlock: 'latest'},
      //             (err2, result2) => {
      //               if (!err2) {
      //                 this.setEventLoadingIndicatorStatus(
      //                     result2.transactionHash, true);
      //                 self.syncEvent(tokenId, result2);
      //               }
      //             });
      //       });
      //
      //       token.Transfer({to: address}, {
      //         fromBlock: latestBlock - (Session.get('AVGBlocksPerDay') * 7), // Last 7 days
      //       }).get((err, result) => {
      //         if (!err) {
      //           self.syncEvents(tokenId, result);
      //           result.forEach((transferEvent) => {
      //             this.setEventLoadingIndicatorStatus(
      //                 transferEvent.transactionHash, true);
      //           });
      //           Session.set('loadingTransferHistory', false);
      //         }
      //         token.Transfer({to: address}, {fromBlock: 'latest'},
      //             (err2, result2) => {
      //               if (!err2) {
      //                 this.setEventLoadingIndicatorStatus(
      //                     result2.transactionHash, true);
      //                 self.syncEvent(tokenId, result2);
      //               }
      //             });
      //       });
      //       if (tokenId === 'W-ETH') {
      //         token.Deposit({}, {
      //           fromBlock: latestBlock - (Session.get('AVGBlocksPerDay') * 7), // Last 7 days
      //         }).get((err, result) => {
      //           if (!err) {
      //             self.syncEvents(tokenId, result);
      //             result.forEach((depositEvent) => {
      //               this.setEventLoadingIndicatorStatus(
      //                   depositEvent.transactionHash, true);
      //             });
      //             Session.set('loadingWrapHistory', false);
      //           }
      //           token.Deposit({}, {fromBlock: 'latest'}, (err2, result2) => {
      //             if (!err2) {
      //               this.setEventLoadingIndicatorStatus(result2.transactionHash,
      //                   true);
      //               self.syncEvent(tokenId, result2);
      //             }
      //           });
      //         });
      //         token.Withdrawal({}, {
      //           fromBlock: latestBlock - (Session.get('AVGBlocksPerDay') * 7), // Last 7 days
      //         }).get((err, result) => {
      //           if (!err) {
      //             self.syncEvents(tokenId, result);
      //             result.forEach((withdrawEvent) => {
      //               this.setEventLoadingIndicatorStatus(
      //                   withdrawEvent.transactionHash, true);
      //             });
      //             Session.set('loadingWrapHistory', false);
      //           }
      //           token.Withdrawal({}, {fromBlock: 'latest'}, (err2, result2) => {
      //             if (!err2) {
      //               this.setEventLoadingIndicatorStatus(result2.transactionHash,
      //                   true);
      //               self.syncEvent(tokenId, result2);
      //             }
      //           });
      //         });
      //       }
      //     }
      //   });
      // });
    },
);

const PrepareRowGNT = createAction(
    PREPARE_ROW_GNT,
    (event, token, type, to) => {
      // const row = {
      //   blockNumber: event.blockNumber,
      //   transactionHash: event.transactionHash,
      //   timestamp: null,
      //   token,
      //   type,
      //   from: Session.get('address'),
      //   to,
      //   amount: event.args.value.toNumber(),
      // };
      //
      // return row;
    },
);

const WatchGNTTokenEvents = createAction(
    WATCH_GNT_TOKEN_EVENTS,
    (latestBlock) => {
      // const self = this;
      // Dapple.getToken('GNT', (errorGNT, GNT) => {
      //   if (!errorGNT) {
      //     Dapple.getToken('W-GNT', (errorWGNT, WGNT) => {
      //       if (!errorWGNT) {
      //         WGNT.getBroker.call((errorBroker, broker) => {
      //           if (!errorBroker &&
      //               broker !== '0x0000000000000000000000000000000000000000') {
      //             GNT.Transfer({from: broker, to: WGNT.address}, {
      //               fromBlock: latestBlock -
      //               (Session.get('AVGBlocksPerDay') * 7), // Last 7 days
      //             }).get((error, result) => {
      //               if (!error) {
      //                 const rows = [];
      //                 for (let i = 0; i < result.length; i++) {
      //                   rows[i] = self.prepareRowGNT(result[i],
      //                       Dapple.getTokenByAddress(WGNT.address),
      //                       'deposit',
      //                       WGNT.address);
      //                   this.setEventLoadingIndicatorStatus(
      //                       result[i].transactionHash, true);
      //                 }
      //                 super.batchInsert(rows, () => {
      //                 });
      //                 Session.set('loadingWrapHistory', false);
      //               }
      //               GNT.Transfer({from: broker, to: WGNT.address},
      //                   {fromBlock: 'latest'}, (error2, result2) => {
      //                     if (!error2) {
      //                       const row = self.prepareRowGNT(result2,
      //                           Dapple.getTokenByAddress(WGNT.address),
      //                           'deposit',
      //                           WGNT.address);
      //                       this.setEventLoadingIndicatorStatus(
      //                           result2.transactionHash, true);
      //                       super.insert(row);
      //                     }
      //                   });
      //             });
      //
      //             GNT.Transfer({from: WGNT.address, to: Session.get('address')},
      //                 {
      //                   fromBlock: latestBlock -
      //                   (Session.get('AVGBlocksPerDay') * 7), // Last 7 days
      //                 }).get((error, result) => {
      //               if (!error) {
      //                 const rows = [];
      //                 for (let i = 0; i < result.length; i++) {
      //                   rows[i] = self.prepareRowGNT(result[i],
      //                       Dapple.getTokenByAddress(WGNT.address),
      //                       'withdrawal',
      //                       Session.get('address'));
      //                   this.setEventLoadingIndicatorStatus(
      //                       result[i].transactionHash, true);
      //                 }
      //                 super.batchInsert(rows, () => {
      //                 });
      //                 Session.set('loadingWrapHistory', false);
      //               }
      //               GNT.Transfer(
      //                   {from: WGNT.address, to: Session.get('address')},
      //                   {fromBlock: 'latest'}, (error2, result2) => {
      //                     if (!error2) {
      //                       const row = self.prepareRowGNT(result2,
      //                           Dapple.getTokenByAddress(WGNT.address),
      //                           'withdrawal',
      //                           Session.get('address'));
      //                       this.setEventLoadingIndicatorStatus(
      //                           result2.transactionHash, true);
      //                       super.insert(row);
      //                     }
      //                   });
      //             });
      //           }
      //         });
      //       }
      //     });
      //   }
      // });
    },
);

const actions = {
  Init,
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
