/* eslint-disable no-unused-vars */
import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import * as BigNumber from "bignumber.js";

import { createPromiseActions } from "../../utils/createPromiseActions";
import { fulfilled } from "../../utils/store";
import {
  ETH_UNIT_ETHER,
  ETH_UNIT_WEI,
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED_MIN_MAX,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED,
} from '../../constants';
import web3, { web3p } from "../../bootstrap/web3";
import balances from "../selectors/balances";
import accounts from "../selectors/accounts";
import network from "../selectors/network";
import { handleTransaction } from "../../utils/transactions/handleTransaction";
import tokens from "../selectors/tokens";

import {
  TX_ALLOWANCE_TRUST_TOGGLE,
} from "./transactions";


const initialState = fromJS({
  accounts: [],
  defaultAccount: {
    loadingAllowances: null,
    loadingBalances: null,
    address: null,
    ethBalance: null,
    tokenBalances: {},
    tokenAllowances: {}
  },
  tokenAllowances: {}
});

const Init = createAction("BALANCES/INIT", () => null);

const getDefaultAccountEthBalance = createAction(
  "BALANCES/GET_DEFAULT_ACCOUNT_ETH_BALANCE",
  async () =>
    web3p.eth
      .getBalance(web3.eth.defaultAccount)
      .then(ethBalanceInWei => web3.fromWei(ethBalanceInWei, ETH_UNIT_ETHER))
);

const getAllTradedTokensBalances = createAction(
  "BALANCES/GET_ALL_TRADED_TOKENS_BALANCES",
  async tokensContractsLists => {
    const tokensBalancesPromises = [];

    Object.entries(tokensContractsLists).forEach(async ([, tokenContract]) => {
      if (tokenContract.balanceOf) {
        tokensBalancesPromises.push(
          tokenContract.balanceOf(web3.eth.defaultAccount)
        );
      }
    });

    return Promise.all(tokensBalancesPromises).then(tokenBalances => {
      const balancesByToken = {};
      Object.keys(tokensContractsLists).forEach(
        (tokenName, i) => (balancesByToken[tokenName] = tokenBalances[i])
      );

      return balancesByToken;
    });
  }
);

const getAllTradedTokensAllowances = createAction(
  "BALANCES/GET_ALL_TRADED_TOKENS_ALLOWANCES",
  async (tokensContractsLists, spenderAddress) => {
    const tokensAllowancesPromises = [];

    Object.entries(tokensContractsLists).forEach(
      async ([tokenName, tokenContract]) => {
        if (tokenContract.allowance) {
          tokensAllowancesPromises.push(
            tokenContract.allowance(web3.eth.defaultAccount, spenderAddress)
          );
        } else {
          throw new Error(`[${tokenName}] contract does not implement ERC-20`);
        }
      }
    );

    return Promise.all(tokensAllowancesPromises).then(tokenAllowances => {
      const allowancesByToken = {};
      Object.keys(tokensContractsLists).forEach(
        (tokenName, i) => (allowancesByToken[tokenName] = tokenAllowances[i])
      );

      return allowancesByToken;
    });
  }
);

const subscribeAccountEthBalanceChangeEvent = createPromiseActions(
  "SUBSCRIBE_ACCOUNT_ETH_BALANCE_CHANGE_EVENT"
);

const subscribeAccountEthBalanceChangeEventEpic = accountAddress => async (
  dispatch,
  getState
) => {
  dispatch(subscribeAccountEthBalanceChangeEvent.pending());
  const allAccountEvents = web3.eth.filter("latest", {
    address: accountAddress
  });
  allAccountEvents.watch(() => {
    web3p.eth.getBalance(accountAddress).then(accEthBalance => {
      const previousBalance = getState().getIn([
        "balances",
        "defaultAccount",
        "ethBalance"
      ]);
      if (previousBalance !== null) {
        if (accEthBalance.cmp(previousBalance)) {
          dispatch(etherBalanceChanged(accEthBalance));
        }
      }
    });
  });
  dispatch(subscribeAccountEthBalanceChangeEvent.fulfilled());
};

const tokenTransferFromEvent = createAction(
  "BALANCES/EVENT___TOKEN_TRANSFER_FROM",
  (tokenName, userAddress, event, addressIsDefaultAccount) => ({
    tokenName,
    userAddress,
    event,
    addressIsDefaultAccount
  })
);

const tokenTransferToEvent = createAction(
  "BALANCES/EVENT___TOKEN_TRANSFER_TO",
  (tokenName, userAddress, event, addressIsDefaultAccount) => ({
    tokenName,
    userAddress,
    event,
    addressIsDefaultAccount
  })
);

const etherBalanceChanged = createAction("BALANCES/ETHER_BALANCE_CHANGED");

const syncTokenBalances$ = createPromiseActions("BALANCES/SYNC_TOKEN_BALANCES");
const syncTokenBalances = (tokensContractsList = [], address) => (
  dispatch,
  getState
) => {
  dispatch(syncTokenBalances$.pending());
  const addressIsDefaultAccount = address === accounts.defaultAccount(getState());
  Object.entries(tokensContractsList).forEach(([tokenName, tokenContract]) => {
    tokenContract.balanceOf(address).then(tokenBalance => {
      if (!tokenBalance.eq(balances.tokenBalance(getState(), {tokenName, balanceUnit: ETH_UNIT_WEI }))) {
        dispatch(
          updateTokenBalance({
            tokenName,
            tokenBalance,
            addressIsDefaultAccount,
            address
          })
        );
      }
    });
  });
  dispatch(syncTokenBalances$.fulfilled());
};

const updateTokenBalance = createAction(
  "BALANCES/UPDATE_TOKEN_BALANCE",
  ({ tokenName, tokenBalance, addressIsDefaultAccount }) => ({
    tokenName,
    tokenBalance,
    addressIsDefaultAccount
  })
);

const subscribeTokenTransfersEvents$ = createPromiseActions(
  "BALANCES/SUBSCRIBE_TOKEN_TRANSFER_EVENT"
);
const subscribeTokenTransfersEventsEpic = (
  tokensContractsList,
  address
) => async (dispatch, getState) => {
  dispatch(subscribeTokenTransfersEvents$.pending());
  const addressIsDefaultAccount =
    address === accounts.defaultAccount(getState());
  Object.entries(tokensContractsList).forEach(([tokenName, tokenContract]) => {
    /**
     * Listen to all erc20 transfer events from now.
     */
    tokenContract.Transfer(
        {},
        { fromBlock: network.latestBlockNumber(getState()), toBlock: "latest" }
      )
      .then((err, transferEvent) => {
        const { from, to } = transferEvent.args;
        if (from === address) {
          dispatch(
            tokenTransferFromEvent(
              tokenName,
              address,
              transferEvent,
              addressIsDefaultAccount
            )
          );
        } else if (to === address) {
          dispatch(
            tokenTransferToEvent(
              tokenName,
              address,
              transferEvent,
              addressIsDefaultAccount
            )
          );
        }
      });
  });
  dispatch(subscribeTokenTransfersEvents$.fulfilled());
};

const setAllowance = createAction(
  "BALANCES/SET_ALLOWANCE",
  (tokenName, spenderAddress, newAllowance) =>
    window.contracts.tokens[tokenName].approve(spenderAddress, newAllowance)
);

const setTokenTrustAddressEnabled = createAction(
  "BALANCES/SET_TOKEN_TRUST_ADDRESS_ENABLED",
  (tokenName, allowanceSubjectAddress) =>
    window.contracts.tokens[tokenName].approve(allowanceSubjectAddress, -1)
);

const setTokenTrustAddressDisabled = createAction(
  "BALANCES/SET_TOKEN_TRUST_ADDRESS_DISABLED",
  (tokenName, spenderAddress) =>
    window.contracts.tokens[tokenName].approve(
      spenderAddress,
      TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED_MIN_MAX
    )
);

const getAccountTokenAllowanceForAddress = createAction(
  "BALANCES/GET_ACCOUNT_TOKEN_ALLOWANCE_FOR_ADDRESS",
  async (tokenName, account, spenderAddress) =>
    window.contracts.tokens[tokenName].allowance(account, spenderAddress)
);

const getDefaultAccountTokenAllowanceForAddress = createAction(
  "BALANCES/GET_DEFAULT_ACCOUNT_TOKEN_ALLOWANCE_FOR_ADDRESS",
  (tokenName, spenderAddress) =>
    window.contracts.tokens[tokenName].allowance(
      web3.eth.defaultAccount,
      spenderAddress
    ),
  (tokenName, spenderAddress) => ({ tokenName, spenderAddress })
);

//TODO: what is it for? no side efects?
const getDefaultAccountTokenAllowanceForMarket = createAction(
  "BALANCES/TOKEN_ALLOWANCE_TRUST_SUBJECT_TYPE_MARKET",
  tokenName =>
    window.contracts.tokens[tokenName].allowance(
      web3.eth.defaultAccount,
      window.contracts.market.address
    ),
  (tokenName) => ({ tokenName, spenderAddress: window.contracts.market.address })
);


const setTokenAllowanceTrustStatus$ = createPromiseActions(
  "BALANCES/SET_TOKEN_ALLOWANCE_TRUST_STATUS"
);
const setTokenAllowanceTrustEpic =
  ({ tokenName, newAllowanceTrustStatus, allowanceSubjectAddress },
   withCallbacks = {},
   { defaultAccount = accounts.defaultAccount,
     tokenAllowanceTrustStatus = balances.tokenAllowanceTrustStatus,
     getErc20Tokens = tokens.getErc20Tokens,
     handleTrans = handleTransaction} = {}) => (dispatch, getState) =>
{
  const defaultAccountAddress = defaultAccount(getState());
  const previousTokenAllowanceTrustStatus = tokenAllowanceTrustStatus(
    getState(),
    tokenName
  );

  dispatch(setTokenAllowanceTrustStatus$.pending());

  if (newAllowanceTrustStatus === undefined) {
    dispatch(
      setTokenAllowanceTrustStatus$.rejected("Trust status not specified")
    );
    return;
  }

  if (newAllowanceTrustStatus === previousTokenAllowanceTrustStatus) {
    dispatch(
      setTokenAllowanceTrustStatus$.rejected("Trust status did not change")
    );
    // console.warn(`[${tokenName}] Trust status did not change`);
    return;
  }

  if (getErc20Tokens(getState()).includes(tokenName)) {
    return handleTrans({
      dispatch,
      transactionType: TX_ALLOWANCE_TRUST_TOGGLE,
      transactionDispatcher: () => {
        switch (newAllowanceTrustStatus) {
          case TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED:
            return dispatch(
              setTokenTrustAddressEnabled(tokenName, allowanceSubjectAddress)
            );

          case TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED:
            return dispatch(
              setTokenTrustAddressDisabled(tokenName, allowanceSubjectAddress)
            );
        }
      },
      txMeta: {
        tokenName,
        account: allowanceSubjectAddress
      },
      withCallbacks,
      onTransactionCompleted: () => {
        dispatch(
          getAccountTokenAllowanceForAddress(
            tokenName,
            defaultAccountAddress,
            allowanceSubjectAddress
          )
        );
      }
    });
  } else {
    throw new Error(`[${tokenName}] Token is not supported`);
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
  setAllowance,
  syncTokenBalances,
  getDefaultAccountTokenAllowanceForMarket,
  setTokenTrustAddressDisabled,
  setTokenTrustAddressEnabled
};

const reducer = handleActions(
  {
    [fulfilled(getDefaultAccountEthBalance)]: (state, { payload }) =>
      state.setIn(["defaultAccount", "ethBalance"], payload.toString()),
    [fulfilled(getAllTradedTokensBalances)]: (state, action) =>
      state.updateIn(["defaultAccount", "tokenBalances"], balances => {
        const tokenBalances = action.payload;
        Object.entries(tokenBalances).forEach(([tokenName, tokenBalance]) => {
          balances = balances.set(
            tokenName,
            tokenBalance ? tokenBalance.toString() : null
          );
        });
        return balances;
      }),
    [fulfilled(getAllTradedTokensAllowances)]: (state, action) =>
      state.updateIn(["defaultAccount", "tokenAllowances"], allowances => {
        const tokenAllowances = action.payload;
        Object.entries(tokenAllowances).forEach(
          ([tokenName, tokenAllowance]) => {
            allowances = allowances.set(
              tokenName,
              tokenAllowance ? tokenAllowance.toString() : null
            );
          }
        );
        return allowances;
      }),
    [tokenTransferFromEvent]: (
      state,
      { payload: { tokenName, event, addressIsDefaultAccount } }
    ) => {
      const path = addressIsDefaultAccount
        ? ["defaultAccount", "tokenBalances", tokenName]
        : ["accounts", event.args.from.toString(), "tokenBalances", tokenName];

      return state.updateIn(path, balance => {
        return new BigNumber(balance).sub(event.args.value).toString();
      });
    },
    [tokenTransferToEvent]: (
      state,
      { payload: { tokenName, event, addressIsDefaultAccount } }
    ) => {
      const path = addressIsDefaultAccount
        ? ["defaultAccount", "tokenBalances", tokenName]
        : ["accounts", event.args.to.toString(), "tokenBalances", tokenName];

      return state.updateIn(path, balance => {
        return new BigNumber(balance).add(event.args.value).toString();
      });
    },
    [etherBalanceChanged]: (state, { payload }) =>
      state.updateIn(["defaultAccount", "ethBalance"], () =>
        payload.toString()
      ),
    [fulfilled(getDefaultAccountTokenAllowanceForAddress)]: (
      state,
      { payload, meta: { tokenName, spenderAddress } }
    ) => state.setIn(["tokenAllowances", tokenName, spenderAddress], payload),
    [updateTokenBalance]: (
      state,
      { payload: { tokenName, tokenBalance, addressIsDefaultAccount, address } }
    ) => {
      const path = addressIsDefaultAccount
        ? ["defaultAccount", "tokenBalances", tokenName]
        : ["accounts", address, "tokenBalances", tokenName];
      return state.setIn(path, tokenBalance.toString());
    }
  },
  initialState
);

export default {
  actions,
  reducer
};
