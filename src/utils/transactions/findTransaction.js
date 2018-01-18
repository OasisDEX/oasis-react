import transactions from '../../store/selectors/transactions';
import { TX__GROUP__LIMITS, TX__GROUP__OFFERS, TX__GROUP__TOKENS } from '../../store/reducers/transactions';

const findTransaction = (txSubjectId, txGroup, state) => {
  switch (txGroup) {
    case TX__GROUP__OFFERS:
      return transactions.getOfferTransaction(state).find(txItem => txItem.txSubjectId == txSubjectId);
    case TX__GROUP__TOKENS:
      return transactions.getTokenTransaction(state).find(txItem => txItem.txSubjectId == txSubjectId);
    case TX__GROUP__LIMITS:
      return transactions.limitsTransactions(state).find(txItem => txItem.txSubjectId == txSubjectId);
  }
};

export default findTransaction();