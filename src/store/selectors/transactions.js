import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';

const transactions = s => s.get('transactions');

const offersTransactions = createSelector(
  transactions,
  s => s.get('offersTransactions')
);
const tokensTransactions = createSelector(
  transactions,
  s => s.get('tokensTransactions')
);
const limitsTransactions = createSelector(
  transactions,
  s => s.get('limitsTransactions')
);


const getOfferTransaction = createSelector(
  offersTransactions,
  reselect.getProps,
  (offersTransactionsList, { offerId }) => offersTransactionsList.find(txEl => txEl.txSubjectId == offerId)
);

const getTokenTransaction = createSelector(
  tokensTransactions,
  reselect.getProps,
  (tokensTransactionsList, { tokenId }) => tokensTransactionsList.find(txEl => txEl.txSubjectId == tokenId)
);

const getLimitTransaction = createSelector(
  limitsTransactions,
  reselect.getProps,
  (limitsTransactionsList, { limitId }) => limitsTransactionsList.find(txEl => txEl.txSubjectId == limitId)
);


export default {
  state: transactions,
  getOfferTransaction,
  getTokenTransaction,
  getLimitTransaction
};