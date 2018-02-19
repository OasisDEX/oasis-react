import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';
import balances from './balances';
import { ETH_UNIT_ETHER } from '../../constants';
import web3 from '../../bootstrap/web3';
import { DEFAULT_GAS_LIMIT } from '../reducers/transactions';

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



const defaultGasLimit = createSelector(
  transactions, s => s.get('defaultGasLimit')
);

const activeGasLimit = createSelector(
  transactions, s => s.get('activeGasLimit')
);

const currentGasPriceWei = createSelector(
  transactions, s => s.get('currentGasPriceInWei')
)


const canSendTransaction = createSelector(
  balances.ethBalance,
  reselect.getProps,
  (ethBalance, gasCost) =>
    web3.toBigNumber(web3.toWei(ethBalance, ETH_UNIT_ETHER)).gte(gasCost || DEFAULT_GAS_LIMIT)
);


export default {
  state: transactions,
  activeGasLimit,
  defaultGasLimit,
  getOfferTransaction,
  getTokenTransaction,
  canSendTransaction,
  currentGasPriceWei
};