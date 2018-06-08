import { createSelector } from "reselect";
import reselect from "../../utils/reselect";
import web3 from "../../bootstrap/web3";
import {
  getTransactionGroup,
  TX__GROUP__LIMITS,
  TX__GROUP__OFFERS,
  TX__GROUP__TOKENS,
  TX__GROUP__TRANSFERS
} from "../reducers/transactions";

import balances from "./balances";
import { DEFAULT_GAS_LIMIT } from '../../constants';

const transactions = s => s.get("transactions");

const transactionsList = createSelector(transactions, s => s.get("txList"));

const offersTransactions = createSelector(transactionsList, s =>
  s.filter(
    offer => getTransactionGroup(offer.get("txType")) === TX__GROUP__OFFERS
  )
);

const tokensTransactions = createSelector(transactionsList, s =>
  s.filter(
    offer => getTransactionGroup(offer.get("txType")) === TX__GROUP__TOKENS
  )
);
const limitsTransactions = createSelector(transactionsList, s =>
  s.filter(
    offer => getTransactionGroup(offer.get("txType")) === TX__GROUP__LIMITS
  )
);

const transferTransactions = createSelector(transactionsList, s =>
  s.filter(
    offer => getTransactionGroup(offer.get("txType")) === TX__GROUP__TRANSFERS
  )
);

const getOfferTransaction = createSelector(
  offersTransactions,
  reselect.getProps,
  (offersTransactions, { offerId }) =>
    offersTransactions.find(
      txEl => parseInt(txEl.get("txSubjectId")) === parseInt(offerId)
    )
);

const getTokenTransaction = createSelector(
  tokensTransactions,
  reselect.getProps,
  (tokensTransactionsList, { tokenId }) =>
    tokensTransactionsList.find(
      txEl => parseInt(txEl.get("txSubjectId")) === parseInt(tokenId)
    )
);

const getLimitTransaction = createSelector(
  limitsTransactions,
  reselect.getProps,
  (limitsTransactionsList, { txTimestamp }) =>
    limitsTransactionsList.find(
      txEl => txEl.getIn(["txStats", "txStartTimestamp"]) === txTimestamp
    )
);

const getTransferTransaction = createSelector(
  transferTransactions,
  reselect.getProps,
  (transfersTransactionsList, txSubjectId) =>
    transfersTransactionsList.find(
      txEl => txEl.get("txSubjectId") === txSubjectId
    )
);

const defaultGasLimit = createSelector(transactions, s =>
  s.get("defaultGasLimit")
);

const activeGasLimit = createSelector(transactions, s =>
  s.get("activeGasLimit")
);

const currentGasPriceWei = createSelector(transactions, s =>
  s.get("currentGasPriceInWei")
);

const canSendTransaction = createSelector(
  balances.ethBalance,
  reselect.getProps,
  (ethBalance, gasCost) =>
    web3.toBigNumber(ethBalance).gte(gasCost || DEFAULT_GAS_LIMIT)
);

const getTransactionByTxHash = createSelector(
  transactionsList,
  reselect.getProps,
  (txList, { txHash }) => txList.find(tx => tx.get("txHash") === txHash)
);

const getTransactionByTimestampAndType = createSelector(
  transactionsList,
  reselect.getProps,
  (txList, { txType, txTimestamp } = {}) =>
    txList.find(
      tx =>
        tx.get("txType") === txType &&
        tx.getIn(["txStats", "txStartTimestamp"]) === txTimestamp
    )
);

const currentTxNonce = createSelector(transactions, s => s.get("txNonce"));

const transactionCheckInterval = createSelector(transactions, s =>
  s.get("transactionCheckIntervalMs")
);

export default {
  state: transactions,
  activeGasLimit,
  defaultGasLimit,
  offersTransactions,
  tokensTransactions,
  limitsTransactions,
  getOfferTransaction,
  getTokenTransaction,
  getLimitTransaction,
  canSendTransaction,
  currentGasPriceWei,
  getTransactionByTxHash,
  currentTxNonce,
  getTransferTransaction,
  getTransactionByTimestampAndType,
  transactionCheckInterval
};
