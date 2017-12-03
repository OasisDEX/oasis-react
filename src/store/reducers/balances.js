import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import {createPromiseActions} from '../../utils/createPromiseActions';
import {fulfilled} from '../../utils/store';


const initialState = Immutable.fromJS({
  accounts: [],
  defaultAccount: {
    address: null,
    ethBalance: null,
    tokenBalances: {},
    tokenAllowances: {}
  },

});

const INIT = 'BALANCES/INIT';
const GET_DEFAULT_ACCOUNT_ETH_BALANCE = 'BALANACES/GET_DEFAULT_ACCOUNT_ETH_BALANCE';
const GET_ALL_TRADED_TOKENS_BALANCES = 'BALANACES/GET_ALL_TRADED_TOKENS_BALANCES';
const GET_ALL_TRADED_TOKENS_ALLOWANCES = 'BALANACES/GET_ALL_TRADED_TOKENS_ALLOWANCES';

const Init = createAction(
  INIT,
  () => null,
);


const getDefaultAccountEthBalance = createAction(
  GET_DEFAULT_ACCOUNT_ETH_BALANCE,
  async () => window.web3p.eth.getBalance(window.web3.eth.defaultAccount)
);



const getAllTradedTokensBalances = createAction(
  GET_ALL_TRADED_TOKENS_BALANCES,
  async (tokensContractsLists) => {

    const tokensBalancesPromises = [];

    Object.entries(tokensContractsLists).forEach(
      async ([tokenName, tokenContract]) => {
          if(tokenContract.balanceOf) {
          tokensBalancesPromises.push(
            tokenContract.balanceOf(window.web3.eth.defaultAccount)
          );
        }
      }
    );

    return Promise.all(tokensBalancesPromises).then(
      tokenBalances => {

        const balancesByToken = {};
        Object.keys(tokensContractsLists).forEach(
          (tokenName, i) => balancesByToken[tokenName] = tokenBalances[i]
        );

        return balancesByToken;
      }
    )
  }
);

const getAllTradedTokensAllowances = createAction(
  GET_ALL_TRADED_TOKENS_ALLOWANCES,
  async (tokensContractsLists, spenderAddress) => {

    const tokensAllowancesPromises = [];

    Object.entries(tokensContractsLists).forEach(
      async ([tokenName, tokenContract]) => {
        if(tokenContract.allowance) {
          tokensAllowancesPromises.push(
            tokenContract.allowance(window.web3.eth.defaultAccount, spenderAddress)
          );
        }
      }
    );

    return Promise.all(tokensAllowancesPromises).then(
      tokenAllowances => {
        const allowancesByToken = {};
        Object.keys(tokensContractsLists).forEach(
          (tokenName, i) => allowancesByToken[tokenName] = tokenAllowances[i]
        );

        return allowancesByToken;
      }
    )
  }
);



const tokenTransferEvent = createAction(
  'BALANCES/EVENT___TOKEN_TRANSFER',
  (tokenName, userAddress, event) => ({ tokenName, event })
)

const tokenTransferFromEvent = createAction(
  'BALANCES/EVENT___TOKEN_TRANSFER_FROM',
  (tokenName, userAddress, event) => ({ tokenName, userAddress, event })
)

const tokenTransferToEvent = createAction(
  'BALANCES/EVENT___TOKEN_TRANSFER_TO',
  (tokenName, userAddress, event) => ({ tokenName, userAddress, event })
);

const subscribeTokenTransfersEvents = createPromiseActions(
  'BALANCES/SUBSCRIBE_TOKEN_TRANSFER_EVENT'
);

const subscribeTokenTransfersEventsEpic = (tokensContractsList, address, config = {}) => async (dispatch) => {
  dispatch(subscribeTokenTransfersEvents.pending());
  Object.entries(tokensContractsList).forEach(
    ([tokenName, tokenContract]) => {
      /**
       * Listen to all erc20 transfer events from now.
       */
      tokenContract.Transfer(address, config)
        .then(
          transferEvent => {
            dispatch(tokenTransferEvent(tokenName, transferEvent, address));
          }
        );
    }
  );
  dispatch(subscribeTokenTransfersEvents.fulfilled());
};

const actions = {
  Init,
  getDefaultAccountEthBalance,
  getAllTradedTokensBalances,
  getAllTradedTokensAllowances,
  subscribeTokenTransfersEventsEpic
};

const reducer = handleActions({

  [fulfilled(getAllTradedTokensBalances)]: (state, action ) =>
    state.updateIn(
      ['defaultAccount', 'tokenBalances'],
      (balances) => {
        const tokenBalances = action.payload;
        Object.entries(tokenBalances).forEach(
          ([tokenName, tokenBalance]) => {
            balances = balances.set(tokenName, tokenBalance ? tokenBalance.toFormat(10) : null)
          }
        );
        return balances
      }),

  [fulfilled(getAllTradedTokensAllowances)]: (state, action ) =>
    state.updateIn(
      ['defaultAccount', 'tokenAllowances'],
      (allowances) => {
        const tokenAllowances = action.payload;
        Object.entries(tokenAllowances).forEach(
          ([tokenName, tokenAllowance]) => {
            allowances = allowances.set(tokenName, tokenAllowance.toFormat(10))
          }
        );
        return allowances
      }),
  [tokenTransferEvent]: (state, { payload: { tokenName, userAddress, event } }) => {

    console.log({tokenName, userAddress, event})
   return state.updateIn(['tokenBalances', tokenName], (balance) => balance)
  }


}, initialState);

export default {
  actions,
  reducer,
};
