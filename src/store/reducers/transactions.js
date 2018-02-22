import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { web3p } from '../../bootstrap/web3';
import { createPromiseActions } from '../../utils/createPromiseActions';
import network from '../selectors/network';
import { fulfilled } from '../../utils/store';

export const DEFAULT_GAS_LIMIT = '10000000';
export const DEFAULT_GAS_PRICE = '1000000';

const initialState = fromJS({
  txList: [],
  defaultGasLimit: DEFAULT_GAS_LIMIT,
  activeGasLimit: DEFAULT_GAS_LIMIT,
  defaultGasPrice: DEFAULT_GAS_PRICE,
  activeGasPrice: DEFAULT_GAS_PRICE,
  currentGasPriceInWei: null,
});

const INIT = 'TX/INIT';
const ADD_TRANSACTION = 'TX/ADD_TRANSACTION';
const SYNC_TRANSACTION = 'TX/SYNC_TRANSACTION';
const OBSERVE_REMOVED = 'TX/OBSERVE_REMOVED';
const SYNC_TRANSACTIONS = 'TX/SYNC_TRANSACTIONS';
const TX_GET_CURRENT_GAS_PRICE = 'TX/GET_CURRENT_GAS_PRICE';

const TX_TRANSACTION_REJECTED = 'TX/TRANSACTION_REJECTED';

export const TX__GROUP__OFFERS = 'TRANSACTIONS/GROUP__OFFERS/';
export const TX__GROUP__TOKENS = 'TX/GROUP__TOKENS/';
export const TX__GROUP__LIMITS = 'TX/GROUP__LIMITS/';

export const TX_OFFER_MAKE = TX__GROUP__OFFERS + 'OFFER_MAKE';
export const TX_OFFER_TAKE = TX__GROUP__OFFERS + 'OFFER_TAKE';

export const TX_OFFER_CANCELLED = TX__GROUP__OFFERS + 'OFFER_CANCELLED';

export const TX_OFFER_PARTIALLY_FULFILLED = TX__GROUP__OFFERS + 'OFFER_FULFILLED_PARTIALLY';
export const TX_OFFER_FULFILLED_COMPLETELY = TX__GROUP__OFFERS + 'OFFER_FULFILLED_COMPLETELY';


export const TX_STATUS_AWAITING_CONFIRMATION = 'TX/STATUS_AWAITING_CONFIRMATION';
export const TX_STATUS_CONFIRMED = 'TX/STATUS_CONFIRMED';
export const TX_STATUS_CANCELLED_BY_USER = 'TX/STATUS_CANCELLED_BY_USER';
export const TX_STATUS_REJECTED = 'TX/STATUS_REJECTED';

export const TX_ALLOWANCE_TRUST_ENABLE = TX__GROUP__LIMITS + 'TX/ALLOWANCE_TRUST_ENABLE';
export const TX_ALLOWANCE_TRUST_DISABLE = TX__GROUP__LIMITS + 'TX/ALLOWANCE_TRUST_DISABLE';


export const getTransactionGroup = (transactionType) => {
  if (0 === transactionType.indexOf(TX__GROUP__OFFERS)) {
    return TX__GROUP__OFFERS;
  } else if (0 === transactionType.indexOf(TX__GROUP__TOKENS)) {
    return TX__GROUP__TOKENS;
  } else if (0 === transactionType.indexOf(TX__GROUP__LIMITS)) {
    return TX__GROUP__LIMITS;
  }
};

const Init = createAction(
  INIT,
  () => null,
);


const transactionCancelledByUser = createAction(
  'TX/TRANSACTION_CANCELLED_BY_USER',
  ({ txType, txStatus, txSubjectId, txStats }) => ({ txType, txStatus, txSubjectId, txStats })
);

const addTransaction = createPromiseActions(ADD_TRANSACTION);
const addTransactionEpic = ({ txStatus, txType, txHash, txSubjectId }) => async (dispatch, getState) => {
  let previousBlockNumber = network.latestBlockNumber(getState());
  dispatch(
    addTransaction.pending({
      txHash,
      txType,
      txStatus: TX_STATUS_AWAITING_CONFIRMATION,
      txSubjectId,
      txStats: {
        txStartBlockNumber: previousBlockNumber,
        txStartTimestamp: parseInt(Date.now() / 1000)
      }
    }),
  );
  return new Promise((resolve, reject) => {
    const complete = setInterval(async () => {
      const currentBlockNumber = network.latestBlockNumber(getState());
      if (currentBlockNumber !== previousBlockNumber) {
        const txReceipt = (await dispatch(syncTransaction(txHash))).value;
        if (txReceipt !== null) {
          if (txReceipt.status) {
            const payload = {
              txHash,
              txReceipt,
              txSubjectId,
              txType,
              txConfirmedBlockNumber: txReceipt.blockNumber,
              txStatus: TX_STATUS_CONFIRMED,
              txGasCost: txReceipt.gasCost,
              txStats: {
                txEndBlockNumber: previousBlockNumber,
                txEndTimestamp: parseInt(Date.now() / 1000)
              }
            };
            dispatch(
              addTransaction.fulfilled(payload)
            );
            resolve(payload);
          } else {
            const payload = {
              txHash,
              txReceipt,
              txSubjectId,
              txType,
              txRejectedBlockNumber: txReceipt.blockNumber,
              txStatus: TX_STATUS_REJECTED,
              txGasCost: txReceipt.gasCost,

            };
            dispatch(
              addTransaction.rejected(payload)
            );
            reject(payload);
          }
          clearInterval(complete);
        }
      }
      previousBlockNumber = network.latestBlockNumber(getState());
    }, 1000);

  });

};

const ObserveRemoved = createAction(
  OBSERVE_REMOVED,
  (type, callback) => {
    // return super.find({ type }).observe({ removed: callback });
  },
);

const syncTransaction = createAction(
  SYNC_TRANSACTION,
  txHash => web3p.eth.getTransactionReceipt(txHash),
  // if (index >= 0 && index < open.length) {
  //   const document = open[index];
  //   web3Obj.eth.getTransactionReceipt(document.tx, (error, result) => {
  //     if (!error && result != null) {
  //       if (result.logs.length > 0) {
  //         console.log('tx_success', document.tx, result.gasUsed);
  //       } else {
  //         console.error('tx_oog', document.tx, result.gasUsed);
  //       }
  //       super.update({tx: document.tx}, {$set: {receipt: result}}, () => {
  //         super.remove({tx: document.tx});
  //       });
  //     }
  //     // Sync next transaction
  //     syncTransaction(index + 1);
  //   });
  // }
);

const SyncTransactions = createAction(
  SYNC_TRANSACTIONS,
  () => {
    // const open = super.find().fetch();
    // Sync all open transactions non-blocking and asynchronously
    // syncTransaction(0);
  },
);

const transactionRejected = createAction(
  TX_TRANSACTION_REJECTED,
  err => err,
);

const getCurrentGasPrice = createAction(
  TX_GET_CURRENT_GAS_PRICE,
  async () => web3p.eth.getGasPrice(),
);

const actions = {
  Init,
  addTransactionEpic,
  transactionRejected,
  ObserveRemoved,
  syncTransaction,
  getCurrentGasPrice,
  transactionCancelledByUser
};

const reducer = handleActions({
  [addTransaction.pending]:
    (
      state, { payload: { txHash, txSubjectId, txType, txStats } },
    ) => {

      const txPayload = fromJS({
        txHash,
        txReceipt: null,
        txSubjectId,
        txType,
        txStatus : TX_STATUS_AWAITING_CONFIRMATION,
        txStats,
      });
      return state.updateIn(
        ['txList'], txList => txList.push(txPayload),
      );
    },
  [addTransaction.fulfilled]:
    (
      state, { payload: { txHash, txReceipt, txSubjectId, txType, txStatus, txStats } },
    ) => {
      const txListIndex = state.get('txList').findIndex(tx => tx.get('txHash') === txHash);
      return state.updateIn(
        ['txList', txListIndex],
        transaction => transaction
          .set('txReceipt', txReceipt)
          .set('txStatus', txStatus)
          .setIn(['txStats','txEndTimestamp'], txStats.txEndTimestamp)
          .setIn(['txStats','txEndBlockNumber'], txStats.txEndBlockNumber)
          .setIn(['txStats','txTotalTimeSec'], txStats.txEndBlockNumber - transaction.getIn('txStartTimestamp'))
        ,
      );
    },
  [addTransaction.rejected]:
    (
      state, { payload: { txHash, txReceipt, txSubjectId, txType, txStatus, txStats } }
    ) => {

    const txListIndex = state.get('txList').findIndex(tx => tx.get('txHash') === txHash);
      return state.updateIn(
        ['txList', txListIndex],
        transaction => transaction
          .set('txReceipt', txReceipt)
          .set('txStatus', txStatus)
          .setIn(['txStats','txEndTimestamp'], txStats.txEndTimestamp)
          .setIn(['txStats','txEndBlockNumber'], txStats.txEndBlockNumber)
          .setIn(['txStats','txTotalTimeSec'], txStats.txEndBlockNumber - transaction.getIn('txStartTimestamp'))
      );
  },
  [transactionCancelledByUser]: (state, { payload: { txType, txStatus, txSubjectId, txStats } }) => {
    const txListIndex = state.get('txList').findIndex(tx => tx.get('txSubjectId') === txSubjectId);
    return state.updateIn(
      ['txList', txListIndex],
      transaction => transaction
        .set('txStatus', TX_STATUS_CANCELLED_BY_USER)
        .setIn(['txStats','txEndTimestamp'], txStats.txEndTimestamp)
        .setIn(['txStats','txEndBlockNumber'], txStats.txEndBlockNumber)
        .setIn(['txStats','txTotalTimeSec'], txStats.txEndBlockNumber - transaction.getIn('txStartTimestamp'))
    );

  },
  [fulfilled(getCurrentGasPrice)]: (state, { payload }) => state.set('currentGasPriceInWei', payload.toString()),
}, initialState);

export default {
  actions,
  reducer,
};
