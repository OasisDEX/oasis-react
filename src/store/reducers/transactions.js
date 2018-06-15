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
import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE } from '../../constants';

const TRANSACTION_CHECK_INTERVAL_MS = 1000;

const initialState = fromJS({
  txList: [],
  defaultGasLimit: DEFAULT_GAS_LIMIT,
  activeGasLimit: DEFAULT_GAS_LIMIT,
  defaultGasPrice: DEFAULT_GAS_PRICE,
  activeGasPrice: DEFAULT_GAS_PRICE,
  currentGasPriceInWei: null,
  txNonce: null,
  transactionCheckIntervalMs: TRANSACTION_CHECK_INTERVAL_MS
});

export const TX__GROUP__OFFERS = 'TRANSACTIONS/GROUP__OFFERS/';
export const TX__GROUP__TOKENS = 'TX/GROUP__TOKENS/';
export const TX__GROUP__LIMITS = 'TX/GROUP__LIMITS/';
export const TX__GROUP__TRANSFERS = 'TX/GROUP__TRANSFERS/';
export const TX__GROUP__WRAP_UNWRAP = 'TX/GROUP__WRAP_UNWRAP/';


export const TX_OFFER_MAKE = TX__GROUP__OFFERS + 'OFFER_MAKE';
export const TX_OFFER_TAKE = TX__GROUP__OFFERS + 'OFFER_TAKE';

export const TX_OFFER_CANCEL = TX__GROUP__OFFERS + 'OFFER_CANCEL';

export const TX_OFFER_PARTIALLY_FULFILLED = TX__GROUP__OFFERS + 'OFFER_FULFILLED_PARTIALLY';
export const TX_OFFER_FULFILLED_COMPLETELY = TX__GROUP__OFFERS + 'OFFER_FULFILLED_COMPLETELY';
export const TX_WRAP_ETHER = TX__GROUP__WRAP_UNWRAP + 'WRAP';
export const TX_WRAP_TOKEN_WRAPPER = TX__GROUP__WRAP_UNWRAP + 'WRAP';
export const TX_UNWRAP_ETHER = TX__GROUP__WRAP_UNWRAP + 'UNWRAP_ETHER';
export const TX_UNWRAP_TOKEN_WRAPPER = TX__GROUP__WRAP_UNWRAP + 'UNWRAP_TOKEN_WRAPPER';


export const TX_STATUS_AWAITING_USER_ACCEPTANCE = 'TX/STATUS_AWAITING_USER_ACCEPTANCE'; // PENDING
export const TX_STATUS_AWAITING_CONFIRMATION = 'TX/STATUS_AWAITING_CONFIRMATION'; // PENDING
export const TX_STATUS_CONFIRMED = 'TX/STATUS_CONFIRMED';
export const TX_STATUS_CANCELLED_BY_USER = 'TX/STATUS_CANCELLED_BY_USER';
export const TX_STATUS_REJECTED = 'TX/STATUS_REJECTED';
export const TX_STATUS_ERROR = 'TX/STATUS_ERROR';

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
  'TX/INIT',
  () => null,
);

const transactionCancelledByUser = createAction(
  'TX/TRANSACTION_CANCELLED_BY_USER',
  ({ txType, txStatus, txStats }) => ({ txType, txStatus, txStats })
);

const addTransaction = createPromiseActions('TX/ADD_TRANSACTION');
const addTransactionEpic = (
  { txType, txHash, txMeta, txDispatchedTimestamp, txStartTimestamp },
  { latestBlockNumber = network.latestBlockNumber,
    sync = syncTransaction,
    transactionCheckInterval = transactions.transactionCheckInterval} = {}
  ) => (dispatch, getState) => {

  // console.log('addTransactionEpic');

  let previousBlockNumber = latestBlockNumber(getState());

  dispatch(
    addTransaction.pending({
      txHash, txType, txMeta,
      txStatus: TX_STATUS_AWAITING_CONFIRMATION,
      txStats: {
        txDispatchedTimestamp, txStartTimestamp,
        txStartBlockNumber: previousBlockNumber}
    }),
  );

  return new Promise((resolve, reject) => {
    const complete = setInterval(async () => {
      const currentBlockNumber = latestBlockNumber(getState());

      // console.log(currentBlockNumber, previousBlockNumber);

      if (currentBlockNumber !== previousBlockNumber) {

        previousBlockNumber = currentBlockNumber;

        let txReceipt;

        // console.log('before syncTransaction', txHash);

        try {
          txReceipt = (await dispatch(sync(txHash))).value;
        } catch (e) {
          //unlimited retries?
          console.warn('syncTransaction result', e);
          return;
        }

        // console.log('txReceipt', txReceipt);

        if (txReceipt == null) return;

        const confirmed = txReceipt.status === TRANSACTION_IS_CONFIRMED;

        // console.log('confirmed', confirmed);

        const payload = {
          txHash, txReceipt, txType,
          txConfirmedBlockNumber: txReceipt.blockNumber,
          txStatus: confirmed ? TX_STATUS_CONFIRMED : TX_STATUS_REJECTED,
          txGasCost: txReceipt.gasCost,
          txStats: {
            txEndBlockNumber: currentBlockNumber,
            txEndTimestamp: getTimestamp()
          }
        };

        // console.log('payload', payload);

        if(confirmed) {
          resolve(payload);
          dispatch(addTransaction.fulfilled(payload));
        } else {
          reject(payload);
          dispatch(addTransaction.rejected(payload));
        }
        clearInterval(complete)
      }
    }, transactionCheckInterval(getState()));
  });
};

const syncTransaction = createAction(
  'TX/SYNC_TRANSACTION',
  txHash => web3p.eth.getTransactionReceipt(txHash),
);

const transactionRejected = createAction(
  'TX/TRANSACTION_REJECTED',
  err => err,
);

const getCurrentGasPrice = createAction(
  'TX/GET_CURRENT_GAS_PRICE',
  async () => web3p.eth.getGasPrice(),
);

const getCurrentTxNonce = createAction(
  'TX/GET_CURRENT_TX_NONCE',
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
      state, { payload: { txHash, txType, txStats, txMeta } },
    ) => {
      const txPayload = fromJS({
        txHash,
        txReceipt: null,
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
          .setIn(['txStats','txTotalTimeSec'], txStats.txEndTimestamp - transaction.getIn('txStartTimestamp'))
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
          .setIn(['txStats','txTotalTimeSec'], txStats.txEndTimestamp - transaction.getIn('txStartTimestamp'))
      );
  },
  [fulfilled(getCurrentTxNonce)]: (state, { payload }) => state.set('txNonce', parseInt(payload) + 1 ),
  [fulfilled(getCurrentGasPrice)]: (state, { payload }) => state.set('currentGasPriceInWei', payload.toString()),
}, initialState);

export default {
  actions,
  reducer,
};
