import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import web3 from '../../bootstrap/web3';
import { change } from 'redux-form/immutable';

import { createPromiseActions } from '../../utils/createPromiseActions';
import transfers from '../selectors/transfers';
import getTokenContractInstance from '../../utils/contracts/getContractInstance';
import { ETH_UNIT_ETHER } from '../../constants';
import network from '../selectors/network';
import { TX_TRANSFER_FROM, TX_STATUS_CANCELLED_BY_USER } from './transactions';
import transactionsReducer from './transactions';
import generateTxSubjectId from '../../utils/transactions/generateTxSubjectId';
import balances from '../selectors/balances';

const initialState = Immutable.fromJS({
  txSubjectId: null
});

const INIT = 'TRANSFERS/INIT';
const TRANSFER_TRANSACTION = 'TRANSFERS/TRANSFER_TRANSACTION';

const Init = createAction(
  INIT,
  () => null,
);


const transferTransaction = createAction(
  TRANSFER_TRANSACTION,
  (tokenName, recipientAddress, tokenAmountInEther) => {
    const contractInstance = getTokenContractInstance(tokenName);
    const tokenAmountWei = web3.toWei(tokenAmountInEther, ETH_UNIT_ETHER);
    return contractInstance.transfer(recipientAddress, tokenAmountWei);
  }
);

const setPendingTransferSubjectId = createAction(
  'TRANSFERS/SET_PENDING_TRANSFER_SUBJECT_ID', txSubjectId => txSubjectId
);
const resetPendingTransferTransactionSubjectId = createAction('TRANSFERS/RESET_PENDING_TRANSFER_TRANSACTION_SUBJECT_ID');

const makeTransfer = createPromiseActions('TRANSFERS/MAKE_TRANSFER');
const makeTransferEpic = () => async (dispatch, getState) => {
  const { recipient, tokenAmount } = transfers.getMakeTransferFormValues(getState());
  dispatch(makeTransfer.pending());

  const token = transfers.selectedToken(getState());
  const txSubjectId = generateTxSubjectId();
  dispatch(setPendingTransferSubjectId(txSubjectId));

  const txMeta = { recipient, tokenAmount, token };
  try {
    const pendingTokenTransferAction = dispatch(
      transferTransaction(token, recipient, tokenAmount)
    );

    const transactionHash = (await pendingTokenTransferAction).value;
    dispatch(
      transactionsReducer.actions.addTransactionEpic({
        txType: TX_TRANSFER_FROM,
        txMeta,
        txHash: transactionHash,
        txSubjectId
      }),
    );
  } catch (e) {
    dispatch(
      transactionsReducer.actions.addTransactionEpic({
        txType: TX_TRANSFER_FROM,
        txMeta,
        txSubjectId
      }),
    );
    dispatch(makeTransfer.rejected());
    dispatch(
      transactionsReducer.actions.transactionCancelledByUser({
        txType: TX_TRANSFER_FROM,
        txMeta,
        txStatus: TX_STATUS_CANCELLED_BY_USER,
        txSubjectId,
        txStats: {
          txEndBlockNumber: network.latestBlockNumber(getState()),
          txEndTimestamp: parseInt(Date.now() / 1000),
        },
      }),
    );
  }
};

const setTransferMax = () => (dispatch, getState) => {
  const maxTransferValueInEther = balances.tokenBalance(getState(), { tokenName: transfers.selectedToken(getState())});
  if (maxTransferValueInEther) {
    dispatch(
      change('tokenTransfer', 'tokenAmount', maxTransferValueInEther)
    );
  }
};

const actions = {
  Init,
  makeTransferEpic,
  setTransferMax,
  resetPendingTransferTransactionSubjectId
};

const reducer = handleActions({
  [setPendingTransferSubjectId]: (state, { payload }) => state.set('txSubjectId', payload),
  [resetPendingTransferTransactionSubjectId]: state => state.set('txSubjectId', null)
}, initialState);

export default {
  actions,
  reducer,
};
