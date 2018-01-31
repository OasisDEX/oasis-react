import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import * as BigNumber from 'bignumber.js';

import { createPromiseActions } from '../../utils/createPromiseActions';
import { fulfilled } from '../../utils/store';
import {
  BN_DECIMAL_PRECISION,
  ETH_UNIT_ETHER, TOKEN_1ST, TOKEN_AUGUR, TOKEN_BAT,
  TOKEN_DAI, TOKEN_DIGIX, TOKEN_ETHER, TOKEN_GNOSIS, TOKEN_ICONOMI,
  TOKEN_MAKER, TOKEN_MLN, TOKEN_NMR, TOKEN_PLUTON, TOKEN_RHOC, TOKEN_SAI, TOKEN_SINGULARDTV, TOKEN_TIME, TOKEN_VSL,
  TOKEN_WRAPPED_ETH,
  TOKEN_WRAPPED_GNT,
} from '../../constants';
import web3, { web3p } from '../../bootstrap/web3';
import balances from '../selectors/balances';
import { TX_STATUS_CANCELLED_BY_USER } from './transactions';
import accounts from '../selectors/accounts';

const initialState = Immutable.fromJS({
  accounts: [],
  defaultAccount: {
    loadingAllowances: null,
    loadingBalances: null,
    address: null,
    ethBalance: null,
    tokenBalances: {},
    tokenAllowances: {},
  },
  tokenAllowances: {},

});

const INIT = 'BALANCES/INIT';
const GET_DEFAULT_ACCOUNT_ETH_BALANCE = 'BALANCES/GET_DEFAULT_ACCOUNT_ETH_BALANCE';
const GET_ALL_TRADED_TOKENS_BALANCES = 'BALANCES/GET_ALL_TRADED_TOKENS_BALANCES';
const GET_ALL_TRADED_TOKENS_ALLOWANCES = 'BALANCES/GET_ALL_TRADED_TOKENS_ALLOWANCES';

const SET_ALLOWANCE = 'BALANCES/SET_ALLOWANCE';

export const ALLOWANCE_STATUS_NO_ENTRY_SET = 'BALANCES/ALLOWANCE_STATUS_NO_ENTRY_SET';

const Init = createAction(
  INIT,
  () => null,
);

const getDefaultAccountEthBalance = createAction(
  GET_DEFAULT_ACCOUNT_ETH_BALANCE,
  async () => web3p.eth.getBalance(web3.eth.defaultAccount)
    .then(ethBalanceInWei => web3.fromWei(ethBalanceInWei, ETH_UNIT_ETHER)),
);

const getAllTradedTokensBalances = createAction(
  GET_ALL_TRADED_TOKENS_BALANCES,
  async (tokensContractsLists) => {

    const tokensBalancesPromises = [];

    Object.entries(tokensContractsLists).forEach(
      async ([tokenName, tokenContract]) => {
        if (tokenContract.balanceOf) {
          tokensBalancesPromises.push(
            tokenContract.balanceOf(web3.eth.defaultAccount),
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
            tokenContract.allowance(web3.eth.defaultAccount, spenderAddress),
          );
        } else {
          throw new Error(`[${tokenName}] contract does not implement ERC-20`);
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
  const allAccountEvents = web3.eth.filter('latest', { address: accountAddress });
  allAccountEvents.watch(
    () => {
      web3p.eth.getBalance(accountAddress).then(
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
          (err, transferEvent) => {
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

const setAllowance = createAction(
  SET_ALLOWANCE,
  (tokenName, spenderAddress, newAllowance) =>
    window.contracts.tokens[tokenName].approve(spenderAddress, newAllowance),
);

const setTokenTrustAddressEnabled = createAction(
  'BALANCES/SET_TOKEN_TRUST_ADDRESS_ENABLED',
  (tokenName, allowanceSubjectAddress) =>
    window.contracts.tokens[tokenName].approve(
      allowanceSubjectAddress, -1,
    ),
);

const setTokenTrustAddressDisabled = createAction(
  'BALANCES/SET_TOKEN_TRUST_ADDRESS_DISABLED',
  (tokenName, spenderAddress) =>
    window.contracts.tokens[tokenName].approve(
      spenderAddress, TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED_MIN_MAX,
    ),
);

const getAccountTokenAllowanceForAddress = createAction(
  'BALANCES/GET_ACCOUNT_TOKEN_ALLOWANCE_FOR_ADDRESS',
  async (tokenName, account, spenderAddress) =>
    window.contracts.tokens[tokenName].allowance(account, spenderAddress),
);

const getDefaultAccountTokenAllowanceForAddress = createAction(
  'BALANCES/GET_DEFAULT_ACCOUNT_TOKEN_ALLOWANCE_FOR_ADDRESS',
  (tokenName, spenderAddress) =>
    window.contracts.tokens[tokenName].allowance(web3.eth.defaultAccount, spenderAddress),
  (tokenName, spenderAddress) => ({ tokenName, spenderAddress }),
);

export const TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED_MIN = '0xffffffffffffffffffffffffffffffff';
export const TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED_MAX = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
export const TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED_MIN_MAX = 0;
export const TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED = true;
export const TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED = false;

export const TOKEN_ALLOWANCE_TRUST_SUBJECT_TYPE_MARKET = 'BALANCES/TOKEN_ALLOWANCE_TRUST_SUBJECT_TYPE_MARKET';
export const TOKEN_ALLOWANCE_TRUST_SUBJECT_TYPE_ADDRESS = 'BALANCES/TOKEN_ALLOWANCE_TRUST_SUBJECT_TYPE_ADDRESS';

const setTokenAllowanceTrustStatus = createPromiseActions('BALANCES/SET_TOKEN_ALLOWANCE_TRUST_STATUS');
const setTokenAllowanceTrustEpic = (tokenName,
                                    newTrustStatus,
                                    allowanceSubjectAddress) => (dispatch, getState) => {

  const defaultAccountAddress = accounts.defaultAccount(getState());
  const previousTokenAllowanceTrustStatus = balances.tokenAllowanceTrustStatus(getState(), tokenName);
  dispatch(setTokenAllowanceTrustStatus.pending());

  if (newTrustStatus === undefined) {
    dispatch(setTokenAllowanceTrustStatus.rejected('Trust status not specified'));
    return;
  }
  if (newTrustStatus === previousTokenAllowanceTrustStatus) {
    dispatch(setTokenAllowanceTrustStatus.rejected('Trust status did not change'));
    console.warn(`[${tokenName}] Trust status did not change`);
    return;
  }

  try {
    switch (tokenName) {
      case TOKEN_WRAPPED_ETH:
      case TOKEN_DAI:
      case TOKEN_SAI:
      case TOKEN_MAKER:
      case TOKEN_WRAPPED_GNT:
      case TOKEN_AUGUR:
      case TOKEN_TIME:
      case TOKEN_SINGULARDTV:
      case TOKEN_1ST:
      case TOKEN_DIGIX:
      case TOKEN_BAT:
      case TOKEN_GNOSIS:
      case TOKEN_ICONOMI:
      case TOKEN_MLN:
      case TOKEN_PLUTON:
      case TOKEN_RHOC:
      case TOKEN_NMR:
      case TOKEN_VSL: {
        switch (newTrustStatus) {

          case TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED: {
            dispatch(
              setTokenTrustAddressEnabled(tokenName, allowanceSubjectAddress)
            ).then(
              txReceipt => {
                dispatch(
                  setTokenAllowanceTrustStatus.fulfilled({ txReceipt }),
                );
                dispatch(
                  getAccountTokenAllowanceForAddress(tokenName, defaultAccountAddress, allowanceSubjectAddress)
                );
              },
            ).catch(
              e =>
                dispatch(
                  setTokenAllowanceTrustStatus.rejected({ e }),
                ),
            );
          }
            break;

          case TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED: {
            dispatch(
              setTokenTrustAddressDisabled(tokenName, allowanceSubjectAddress)
            ).then(
              txReceipt => {
                dispatch(
                  setTokenAllowanceTrustStatus.fulfilled({ txReceipt }),
                );
                dispatch(
                  getAccountTokenAllowanceForAddress(tokenName, defaultAccountAddress, allowanceSubjectAddress)
                );
              },
            ).catch(
              e =>
                dispatch(
                  setTokenAllowanceTrustStatus.rejected({
                    tokenTrustSubjectType: TOKEN_ALLOWANCE_TRUST_SUBJECT_TYPE_ADDRESS, e,
                  }),
                ),
            );
          }
            break;
        }
      }
        break;

      default:
        throw new Error(`[${tokenName}] Token is not supported`);
    }

  } catch (e) {
    console.log(TX_STATUS_CANCELLED_BY_USER);
  }

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
  setTokenAllowanceTrustEpic,
  getDefaultAccountTokenAllowanceForAddress,
};

const reducer = handleActions({
  [fulfilled(getDefaultAccountEthBalance)]: (state, { payload }) =>
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
            allowances = allowances.set(tokenName, tokenAllowance ? tokenAllowance.toString() : null);
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
  [fulfilled(getDefaultAccountTokenAllowanceForAddress)]: (state, { payload, meta: { tokenName, spenderAddress } }) =>
    state.setIn(['tokenAllowances', tokenName, spenderAddress], payload)
  ,
}, initialState);

export default {
  actions,
  reducer,
};
