import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';
import { ETH_UNIT_ETHER } from '../../constants';
import web3 from '../../bootstrap/web3';
import {
  DEFAULT_GAS_LIMIT,
  getTransactionGroup,
  TX__GROUP__LIMITS,
  TX__GROUP__OFFERS,
  TX__GROUP__TOKENS,
} from '../reducers/transactions';

import balances from './balances';

const transactions = s => s.get('transactions');

const transactionsList = createSelector(
  transactions, s => s.get('txList'),
);

const offersTransactions = createSelector(
  transactionsList,
  s => s.filter(
    offer => getTransactionGroup(offer.get('txType')) === TX__GROUP__OFFERS
  )
);

const tokensTransactions = createSelector(
  transactionsList,
  s => s.filter(
    offer => getTransactionGroup(offer.get('txType')) === TX__GROUP__TOKENS
  ),
);
const limitsTransactions = createSelector(
  transactionsList,
  s => s.filter(
    offer => getTransactionGroup(offer.get('txType')) === TX__GROUP__LIMITS
  )
);

const getOfferTransaction = createSelector(
  offersTransactions,
  reselect.getProps,
  (offersTransactions, { offerId }) =>
    offersTransactions.find(
        txEl => parseInt(txEl.get('txSubjectId')) === parseInt(offerId))
);

const getTokenTransaction = createSelector(
  tokensTransactions,
  reselect.getProps,
  (tokensTransactionsList, { tokenId }) =>
    tokensTransactionsList.find(
      txEl => parseInt(txEl.get('txSubjectId')) === parseInt(tokenId)
    )
);

const getLimitTransaction = createSelector(
  limitsTransactions,
  reselect.getProps,
  (limitsTransactionsList, { address }) =>
    limitsTransactionsList.find(
      txEl => txEl.get('txSubjectId') === address
    )
);

const defaultGasLimit = createSelector(
  transactions, s => s.get('defaultGasLimit'),
);

const activeGasLimit = createSelector(
  transactions, s => s.get('activeGasLimit'),
);

const currentGasPriceWei = createSelector(
  transactions, s => s.get('currentGasPriceInWei'),
);

const canSendTransaction = createSelector(
  balances.ethBalance,
  reselect.getProps,
  (ethBalance, gasCost) =>
    web3.toBigNumber(web3.toWei(ethBalance, ETH_UNIT_ETHER)).gte(gasCost || DEFAULT_GAS_LIMIT),
);

const getTransactionByTxHash = createSelector(
  transactionsList,
  reselect.getProps,
  (txList, { txHash }) =>
    txList.find(tx => tx.get('txHash') === txHash)
);


const getAllowanceTxNonce = createSelector(
  limitsTransactions,
  reselect.getProps,
  (limitsTxList, filter) => limitsTxList.filter(limitTx => limitTx.get('txSubjectId') == filter).size()
);


const currentTxNonce = createSelector(
  transactions,
  s => s.get('txNonce')
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
  getAllowanceTxNonce,
  currentTxNonce,
};