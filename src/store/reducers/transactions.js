import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { web3p } from '../../bootstrap/web3';
import { createPromiseActions } from '../../utils/createPromiseActions';
import network from '../selectors/network';
import { fulfilled } from '../../utils/store';
import web3 from '../../bootstrap/web3';
import accounts from '../selectors/accounts';
import { getTimestamp } from '../../utils/time';
import transactions from '../selectors/transactions';

export const DEFAULT_GAS_LIMIT = '10000000';
export const DEFAULT_GAS_PRICE = '1000000';

const initialState = fromJS({
  txList: [],
  pendingTxSubjectIds: [],
  defaultGasLimit: DEFAULT_GAS_LIMIT,
  activeGasLimit: DEFAULT_GAS_LIMIT,
  defaultGasPrice: DEFAULT_GAS_PRICE,
  activeGasPrice: DEFAULT_GAS_PRICE,
  currentGasPriceInWei: null,
  txNonce: null,
  transactionCheckIntervalMs: 1000
});

const INIT = 'TX/INIT';
const ADD_TRANSACTION = 'TX/ADD_TRANSACTION';
const SYNC_TRANSACTION = 'TX/SYNC_TRANSACTION';
const TX_GET_CURRENT_GAS_PRICE = 'TX/GET_CURRENT_GAS_PRICE';
const TX_GET_CURRENT_TX_NONCE = 'TX/GET_CURRENT_TX_NONCE';


const TX_TRANSACTION_REJECTED = 'TX/TRANSACTION_REJECTED';

export const TX__GROUP__OFFERS = 'TRANSACTIONS/GROUP__OFFERS/';
export const TX__GROUP__TOKENS = 'TX/GROUP__TOKENS/';
export const TX__GROUP__LIMITS = 'TX/GROUP__LIMITS/';
export const TX__GROUP__TRANSFERS = 'TX/GROUP__TRANSFERS/';

export const TX_OFFER_MAKE = TX__GROUP__OFFERS + 'OFFER_MAKE';
export const TX_OFFER_TAKE = TX__GROUP__OFFERS + 'OFFER_TAKE';

export const TX_TRANSFER_FROM = TX__GROUP__TRANSFERS + 'TRANSFER_FROM';
export const TX_TRANSFER_TO = TX__GROUP__TRANSFERS + 'TRANSFER_TO';

export const TX_OFFER_CANCELLED = TX__GROUP__OFFERS + 'OFFER_CANCELLED';

export const TX_OFFER_PARTIALLY_FULFILLED = TX__GROUP__OFFERS + 'OFFER_FULFILLED_PARTIALLY';
export const TX_OFFER_FULFILLED_COMPLETELY = TX__GROUP__OFFERS + 'OFFER_FULFILLED_COMPLETELY';


export const TX_STATUS_AWAITING_USER_ACCEPTANCE = 'TX/STATUS_AWAITING_USER_ACCEPTANCE'; // PENDING
export const TX_STATUS_AWAITING_CONFIRMATION = 'TX/STATUS_AWAITING_CONFIRMATION'; // PENDING
export const TX_STATUS_CONFIRMED = 'TX/STATUS_CONFIRMED';
export const TX_STATUS_CANCELLED_BY_USER = 'TX/STATUS_CANCELLED_BY_USER';
export const TX_STATUS_REJECTED = 'TX/STATUS_REJECTED';

export const TX_ALLOWANCE_TRUST_ENABLE = TX__GROUP__LIMITS + 'TX/ALLOWANCE_TRUST_ENABLE';
export const TX_ALLOWANCE_TRUST_DISABLE = TX__GROUP__LIMITS + 'TX/ALLOWANCE_TRUST_DISABLE';
export const TX_ALLOWANCE_TRUST_TOGGLE = TX__GROUP__LIMITS + 'TX/ALLOWANCE_TRUST_TOGGLE';

export const TRANSACTION_IS_CONFIRMED = '0x1';
export const TRANSACTION_IS_REJECTED = '0x0';

export const getTransactionGroup = (transactionType) => {
  if (0 === transactionType.indexOf(TX__GROUP__OFFERS)) {
    return TX__GROUP__OFFERS;
  } else if (0 === transactionType.indexOf(TX__GROUP__TOKENS)) {
    return TX__GROUP__TOKENS;
  } else if (0 === transactionType.indexOf(TX__GROUP__LIMITS)) {
    return TX__GROUP__LIMITS;
  } else if (0 === transactionType.indexOf(TX__GROUP__TRANSFERS)) {
    return TX__GROUP__TRANSFERS;
  }
};

const init = createAction(
  INIT,
  () => null,
);


const transactionCancelledByUser = createAction(
  'TX/TRANSACTION_CANCELLED_BY_USER',
  ({ txType, txStatus, txStats }) => ({ txType, txStatus, txStats })
);

const addTransaction = createPromiseActions(ADD_TRANSACTION);
const addTransactionEpic = ({ txType, txHash, txMeta, txDispatchedTimestamp, txStartTimestamp }) => async (dispatch, getState) => {
  console.log('addTransactionEpic', { txType, txHash, txMeta, txDispatchedTimestamp, txStartTimestamp })
  let previousBlockNumber = network.latestBlockNumber(getState());
  dispatch(
    addTransaction.pending({
      txHash,
      txType,
      txMeta,
      txStatus: TX_STATUS_AWAITING_CONFIRMATION,
      txStats: {
        txDispatchedTimestamp,
        txStartBlockNumber: previousBlockNumber,
        txStartTimestamp
      }
    }),
  );
  return new Promise((resolve, reject) => {
    const complete = setInterval(async () => {
      const currentBlockNumber = network.latestBlockNumber(getState());
      if (currentBlockNumber !== previousBlockNumber) {
        const txReceipt = (await dispatch(syncTransaction(txHash))).value;
        if (txReceipt !== null) {
          switch (txReceipt.status) {
            case TRANSACTION_IS_CONFIRMED: {
              const payload = {
                txHash,
                txReceipt,
                txType,
                txConfirmedBlockNumber: txReceipt.blockNumber,
                txStatus: TX_STATUS_CONFIRMED,
                txGasCost: txReceipt.gasCost,
                txStats: {
                  txEndBlockNumber: previousBlockNumber,
                  txEndTimestamp: getTimestamp()
                }
              };
              dispatch(
                addTransaction.fulfilled(payload)
              );
              clearInterval(complete);
              resolve(payload);

            } break;
            case TRANSACTION_IS_REJECTED: {
              const payload = {
                txHash,
                txReceipt,
                txType,
                txRejectedBlockNumber: txReceipt.blockNumber,
                txStatus: TX_STATUS_REJECTED,
                txGasCost: txReceipt.gasCost,
                txEndTimestamp: getTimestamp()
              };
              dispatch(
                addTransaction.rejected(payload)
              );
              clearInterval(complete);
              reject(payload);
            } break;
          }
        }
      }
      previousBlockNumber = network.latestBlockNumber(getState());
    }, transactions.transactionCheckInterval(getState()));

  });

};

const syncTransaction = createAction(
  SYNC_TRANSACTION,
  txHash => web3p.eth.getTransactionReceipt(txHash),
);


const transactionRejected = createAction(
  TX_TRANSACTION_REJECTED,
  err => err,
);

const getCurrentGasPrice = createAction(
  TX_GET_CURRENT_GAS_PRICE,
  async () => web3p.eth.getGasPrice(),
);

const getCurrentTxNonce = createAction(
  TX_GET_CURRENT_TX_NONCE,
  async (accountAddress) => web3p.eth.getTransactionCount(accountAddress || web3.eth.defaultAccount)
);

const getCurrentTxNonceEpic = (address) => (dispatch, getState) => {
  const subjectAddress = address || accounts.defaultAccount(getState());
  dispatch(getCurrentTxNonce(subjectAddress));
};

const actions = {
  init,
  addTransactionEpic,
  transactionRejected,
  syncTransaction,
  getCurrentGasPrice,
  transactionCancelledByUser,
  getCurrentTxNonceEpic
};

const reducer = handleActions({
  [addTransaction.pending]:
    (
      state, { payload: { txHash, txSubjectId, txType, txStats, txMeta } },
    ) => {

      const txPayload = fromJS({
        txHash,
        txReceipt: null,
        txSubjectId,
        txType,
        txStatus : TX_STATUS_AWAITING_CONFIRMATION,
        txStats,
        txMeta
      });
      return state.updateIn(
        ['txList'], txList => txList.push(txPayload),
      );
    },
  [addTransaction.fulfilled]:
    (
      state, { payload: { txHash, txReceipt, txStatus, txStats } },
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
      state, { payload: { txHash, txReceipt, txStatus, txStats } }
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
  [transactionCancelledByUser]: (state, { payload: { txSubjectId, txStats } }) => {
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
  [fulfilled(getCurrentTxNonce)]: (state, { payload }) => state.set('txNonce', parseInt(payload) + 1 ),
  [fulfilled(getCurrentGasPrice)]: (state, { payload }) => state.set('currentGasPriceInWei', payload.toString()),
}, initialState);

export default {
  actions,
  reducer,
};
