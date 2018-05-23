import { createAction, handleActions } from "redux-actions";
import Immutable from "immutable";
import web3 from "../../bootstrap/web3";
import { change } from "redux-form/immutable";
import { reset } from 'redux-form/immutable';

import { createPromiseActions } from "../../utils/createPromiseActions";
import transfers from "../selectors/transfers";
import getTokenContractInstance from "../../utils/contracts/getContractInstance";
import { ETH_UNIT_ETHER } from "../../constants";
import { TX__GROUP__TRANSFERS } from "./transactions";
import balances from "../selectors/balances";
import { handleTransaction } from "../../utils/transactions/handleTransaction";

const initialState = Immutable.fromJS({});

const Init = createAction('TRANSFERS/INIT', () => null);

const transferTransaction = createAction(
  'TRANSFERS/TRANSFER_TRANSACTION',
  (tokenName, recipientAddress, tokenAmountInEther) => {
    const contractInstance = getTokenContractInstance(tokenName);
    const tokenAmountWei = web3.toWei(tokenAmountInEther, ETH_UNIT_ETHER);
    return contractInstance.transfer(recipientAddress, tokenAmountWei);
  }
);

const makeTransfer = createPromiseActions("TRANSFERS/MAKE_TRANSFER");
const makeTransferEpic = (withCallbacks = {}) => async (dispatch, getState) => {
  const { recipient, tokenAmount } = transfers.getMakeTransferFormValues(
    getState()
  );
  dispatch(makeTransfer.pending());

  const token = transfers.selectedToken(getState());

  const txMeta = { recipient, tokenAmount, token };

  return handleTransaction({
    dispatch,
    transactionDispatcher: () =>
      dispatch(transferTransaction(token, recipient, tokenAmount)),
    transactionType: TX__GROUP__TRANSFERS,
    txMeta,
    withCallbacks
  });
};

const setTransferMax = () => (dispatch, getState) => {
  const maxTransferValueInEther = balances.tokenBalance(getState(), {
    tokenName: transfers.selectedToken(getState())
  });
  if (maxTransferValueInEther) {
    dispatch(change("tokenTransfer", "tokenAmount", maxTransferValueInEther.toString()));
  }
};


const resetTransferForm = () => dispatch => {
  dispatch(reset('tokenTransfer'));
};

const actions = {
  Init,
  makeTransferEpic,
  setTransferMax,
  resetTransferForm
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer
};
