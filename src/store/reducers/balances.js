import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import * as BigNumber from 'bignumber.js';

import { createPromiseActions } from '../../utils/createPromiseActions';
import { fulfilled } from '../../utils/store';
import { BN_DECIMAL_PRECISION, ETH_UNIT_ETHER } from '../../constant';

const initialState = Immutable.fromJS({
  accounts: [],
  defaultAccount: {
    address: null,
    ethBalance: null,
    tokenBalances: {},
    tokenAllowances: {},
  },

});

const INIT = 'BALANCES/INIT';
const GET_DEFAULT_ACCOUNT_ETH_BALANCE = 'BALANCES/GET_DEFAULT_ACCOUNT_ETH_BALANCE';
const GET_ALL_TRADED_TOKENS_BALANCES = 'BALANCES/GET_ALL_TRADED_TOKENS_BALANCES';
const GET_ALL_TRADED_TOKENS_ALLOWANCES = 'BALANCES/GET_ALL_TRADED_TOKENS_ALLOWANCES';

const Init = createAction(
  INIT,
  () => null,
);

const getDefaultAccountEthBalance = createAction(
  GET_DEFAULT_ACCOUNT_ETH_BALANCE,
  async () => window.web3p.eth.getBalance(window.web3.eth.defaultAccount)
    .then(ethBalanceInWei => window.web3.fromWei(ethBalanceInWei, ETH_UNIT_ETHER)),
);

const getAllTradedTokensBalances = createAction(
  GET_ALL_TRADED_TOKENS_BALANCES,
  async (tokensContractsLists) => {

    const tokensBalancesPromises = [];

    Object.entries(tokensContractsLists).forEach(
      async ([tokenName, tokenContract]) => {
        if (tokenContract.balanceOf) {
          tokensBalancesPromises.push(
            tokenContract.balanceOf(window.web3.eth.defaultAccount),
          );
        }
      },
    );

    return Promise.all(tokensBalancesPromises).then(
      tokenBalances => {

        const balancesByToken = {};
        Object.keys(tokensContractsLists).forEach(
          (tokenName, i) => balancesByToken[tokenName] = tokenBalances[i],
        );

        return balancesByToken;
      },
    );
  },
);

const getAllTradedTokensAllowances = createAction(
  GET_ALL_TRADED_TOKENS_ALLOWANCES,
  async (tokensContractsLists, spenderAddress) => {

    const tokensAllowancesPromises = [];

    Object.entries(tokensContractsLists).forEach(
      async ([tokenName, tokenContract]) => {
        if (tokenContract.allowance) {
          tokensAllowancesPromises.push(
            tokenContract.allowance(window.web3.eth.defaultAccount, spenderAddress),
          );
        }
      },
    );

    return Promise.all(tokensAllowancesPromises).then(
      tokenAllowances => {
        const allowancesByToken = {};
        Object.keys(tokensContractsLists).forEach(
          (tokenName, i) => allowancesByToken[tokenName] = tokenAllowances[i],
        );

        return allowancesByToken;
      },
    );
  },
);

const subscribeAccountEthBalanceChangeEvent = createPromiseActions(
  'SUBSCRIBE_ACCOUNT_ETH_BALANCE_CHANGE_EVENT',
);

const subscribeAccountEthBalanceChangeEventEpic = (accountAddress) => async (dispatch, getState) => {
  dispatch(subscribeAccountEthBalanceChangeEvent.pending());
  const allAccountEvents = window.web3.eth.filter('latest', { address: accountAddress });
  allAccountEvents.watch(
    () => {
      window.web3p.eth.getBalance(accountAddress).then(
        accEthBalance => {
          const previousBalance = getState().getIn(['balances', 'defaultAccount', 'ethBalance']);
          if (previousBalance !== null) {
            if (accEthBalance.cmp(previousBalance)) {
              dispatch(etherBalanceChanged(accEthBalance));
            }
          }

        },
      );

    },
  );
  dispatch(subscribeAccountEthBalanceChangeEvent.fulfilled());
};

const tokenTransferEvent = createAction(
  'BALANCES/EVENT___TOKEN_TRANSFER',
  (tokenName, userAddress, event) => ({ tokenName, event }),
);

const tokenTransferFromEvent = createAction(
  'BALANCES/EVENT___TOKEN_TRANSFER_FROM',
  (tokenName, userAddress, event) => ({ tokenName, userAddress, event }),
);

const tokenTransferToEvent = createAction(
  'BALANCES/EVENT___TOKEN_TRANSFER_TO',
  (tokenName, userAddress, event) => ({ tokenName, userAddress, event }),
);

const subscribeTokenTransfersEvents = createPromiseActions(
  'BALANCES/SUBSCRIBE_TOKEN_TRANSFER_EVENT',
);

const tokenSetBalanceOf = createPromiseActions(
  'BALANCES/TOKEN_SET_BALANCE_OF',
);

const etherBalanceChanged = createAction(
  'BALANCES/ETHER_BALANCE_CHANGED',
);

const subscribeTokenTransfersEventsEpic = (tokensContractsList, address, config = {}) => async (dispatch) => {
  dispatch(subscribeTokenTransfersEvents.pending());
  Object.entries(tokensContractsList).forEach(
    ([tokenName, tokenContract]) => {
      /**
       * Listen to all erc20 transfer events from now.
       */
      tokenContract.Transfer(config)
        .then(
          transferEvent => {
            const { from, to } = transferEvent.args;
            if (from === address) {
              dispatch(tokenTransferFromEvent(tokenName, address, transferEvent));
            } else if (to === address) {
              dispatch(tokenTransferToEvent(tokenName, address, transferEvent));
            }
          },
        );
    },
  );
  dispatch(subscribeTokenTransfersEvents.fulfilled());
};

const actions = {
  Init,
  getDefaultAccountEthBalance,
  getAllTradedTokensBalances,
  getAllTradedTokensAllowances,
  subscribeTokenTransfersEventsEpic,
  tokenTransferToEvent,
  tokenTransferFromEvent,
  subscribeAccountEthBalanceChangeEventEpic,
};

const reducer = handleActions({
  [fulfilled(getDefaultAccountEthBalance)]: (state, {payload}) =>
    state.setIn(['defaultAccount', 'ethBalance'], payload.toFormat(BN_DECIMAL_PRECISION)),
  [fulfilled(getAllTradedTokensBalances)]: (state, action) =>
    state.updateIn(
      ['defaultAccount', 'tokenBalances'],
      (balances) => {
        const tokenBalances = action.payload;
        Object.entries(tokenBalances).forEach(
          ([tokenName, tokenBalance]) => {
            balances = balances.set(tokenName, tokenBalance ? tokenBalance.toFormat(BN_DECIMAL_PRECISION) : null);
          },
        );
        return balances;
      }),
  [fulfilled(getAllTradedTokensAllowances)]: (state, action) =>
    state.updateIn(
      ['defaultAccount', 'tokenAllowances'],
      (allowances) => {
        const tokenAllowances = action.payload;
        Object.entries(tokenAllowances).forEach(
          ([tokenName, tokenAllowance]) => {
            allowances = allowances.set(tokenName, tokenAllowance ? tokenAllowance.toFormat(BN_DECIMAL_PRECISION) : null);
          },
        );
        return allowances;
      }),
  [fulfilled(tokenTransferFromEvent)]: (state, { payload: { tokenName, event } }) => {
    return state.updateIn(['tokenBalances', tokenName], (balance) =>
      new BigNumber(balance).sub(event.args.value)).toFormat(BN_DECIMAL_PRECISION);
  },
  [fulfilled(tokenTransferToEvent)]: (state, { payload: { tokenName, event } }) => {
    return state.updateIn(['tokenBalances', tokenName], (balance) =>
      new BigNumber(balance).add(event.args.value)).toFormat(BN_DECIMAL_PRECISION);
  },
  [etherBalanceChanged]: (state, { payload }) =>
    state.updateIn(['defaultAccount', 'ethBalance'], () => payload),
}, initialState);

export default {
  actions,
  reducer,
};
