/* eslint-disable no-unused-vars */
import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import * as BigNumber from "bignumber.js";

import { createPromiseActions } from "../../utils/createPromiseActions";
import { fulfilled } from "../../utils/store";
import {
  DEFAULT_GAS_LIMIT,
  DEFAULT_GAS_PRICE,
  ETH_UNIT_ETHER,
  ETH_UNIT_WEI,
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED_MIN_MAX,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED
} from "../../constants";
import web3, {
  registerAccountSpecificSubscriptions,
  web3p
} from "../../bootstrap/web3";
import balances from "../selectors/balances";
import accounts from "../selectors/accounts";
import network from "../selectors/network";
import { handleTransaction } from "../../utils/transactions/handleTransaction";
import tokens from "../selectors/tokens";

import { TX_ALLOWANCE_TRUST_TOGGLE } from "./transactions";
import {
  getMarketContractInstance,
  getTokenContractInstance
} from "../../bootstrap/contracts";
import { getTimestamp } from "../../utils/time";
import { convertTo18Precision } from "../../utils/conversion";

const initialState = fromJS({
  accounts: [],
  loadingAllowances: null,
  loadingBalances: null,
  address: null,
  ethBalance: null,
  tokenBalances: {},
  tokenAllowances: {},
  latestBalancesSyncTimestamp: null,
  latestBalancesSyncBlockNumber: null
});

const Init = createAction("BALANCES/INIT", () => null);

const getDefaultAccountEthBalance = createAction(
  "BALANCES/GET_DEFAULT_ACCOUNT_ETH_BALANCE",
  async () =>
    web3p.eth
      .getBalance(web3.eth.defaultAccount)
      .then(ethBalanceInWei => ethBalanceInWei)
);

const getAllTradedTokensBalances = createAction(
  "BALANCES/GET_ALL_TRADED_TOKENS_BALANCES",
  async (tokensContractsLists, accountAddress) => {
    const tokensBalancesPromises = [];

    Object.entries(tokensContractsLists).forEach(async ([, tokenContract]) => {
      if (tokenContract.balanceOf) {
        tokensBalancesPromises.push(tokenContract.balanceOf(accountAddress));
      }
    });

    return Promise.all(tokensBalancesPromises).then(tokenBalances => {
      const balancesByToken = {};
      Object.keys(tokensContractsLists).forEach(
        (tokenName, i) =>
          (balancesByToken[tokenName] = convertTo18Precision(
            tokenBalances[i],
            tokenName
          ))
      );

      return balancesByToken;
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
  registerAccountSpecificSubscriptions({
    ethBalanceChangeEventSub: allAccountEvents.watch(() => {
      web3p.eth.getBalance(accountAddress).then(accEthBalance => {
        const previousBalance = getState().getIn(["balances", "ethBalance"]);
        if (previousBalance !== null) {
          if (accEthBalance.cmp(previousBalance)) {
            dispatch(etherBalanceChanged(accEthBalance));
          }
        }
      });
    })
  });
  dispatch(subscribeAccountEthBalanceChangeEvent.fulfilled());
};

const tokenTransferFromEvent = createAction(
  "BALANCES/EVENT___TOKEN_TRANSFER_FROM",
  (tokenName, userAddress, event, shouldUpdateBalance = false) => ({
    tokenName,
    userAddress,
    event,
    shouldUpdateBalance
  })
);

const tokenBalanceUpdateEvent = createAction(
  "BALANCES/EVENT___TOKEN_BALANCE_UPDATE",
  (tokenName, userAddress, event) => ({
    tokenName,
    userAddress,
    event
  })
);

const tokenTransferToEvent = createAction(
  "BALANCES/EVENT___TOKEN_TRANSFER_TO",
  (tokenName, userAddress, event, shouldUpdateBalance = false) => ({
    tokenName,
    userAddress,
    event,
    shouldUpdateBalance
  })
);

const etherBalanceChanged = createAction("BALANCES/ETHER_BALANCE_CHANGED");

const syncTokenBalances$ = createPromiseActions("BALANCES/SYNC_TOKEN_BALANCES");

const syncTokenBalance = createAction(
  "BALANCES/SYNC_TOKEN_BALANCE",
  ({ tokenName, accountAddress }) =>
    getTokenContractInstance(tokenName).balanceOf(accountAddress)
);

const syncTokenBalanceEpic = ({ tokenName, accountAddress }) => (
  dispatch,
  getState
) => {
  dispatch(syncTokenBalance({ tokenName, accountAddress })).then(
    ({ value: newTokenBalance }) => {
      if (
        !newTokenBalance.eq(balances.tokenBalance(getState(), { tokenName }))
      ) {
        dispatch(
          updateTokenBalance({
            tokenName,
            tokenBalance: convertTo18Precision(newTokenBalance, tokenName),
            address: accountAddress
          })
        );
      }
    }
  );
};

const syncTokenBalances = (tokensContractsList = [], address) => (
  dispatch,
  getState
) => {
  dispatch(syncTokenBalances$.pending());

  Object.entries(tokensContractsList).forEach(([tokenName, tokenContract]) => {
    tokenContract.balanceOf(address).then(tokenBalance => {
      const balanceInWei = web3.toBigNumber(
        convertTo18Precision(tokenBalance, tokenName)
      );
      const oldBalance = balances.tokenBalance(getState(), {
        tokenName,
        balanceUnit: ETH_UNIT_WEI
      });
      if (oldBalance !== null && !balanceInWei.eq(oldBalance)) {
        dispatch(
          updateTokenBalance({
            tokenName,
            tokenBalance: balanceInWei,
            address
          })
        );
      }
    });
  });
  dispatch(syncTokenBalances$.fulfilled());
  dispatch(
    setLatestBalancesSyncBlockNumber(network.latestBlockNumber(getState()))
  );
  dispatch(setLatestBalancesSyncTimestamp());
};

const updateTokenBalance = createAction(
  "BALANCES/UPDATE_TOKEN_BALANCE",
  ({ tokenName, tokenBalance }) => ({
    tokenName,
    tokenBalance
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
  let subscriptionsMap = fromJS({});
  Object.entries(tokensContractsList).forEach(([tokenName, tokenContract]) => {
    /**
     * Listen to all erc20 transfer events from now.
     */
    const subscription = tokenContract
      .Transfer(
        {},
        { fromBlock: network.latestBlockNumber(getState()), toBlock: "latest" }
      )
      .then((err, transferEvent) => {
        const { from, to } = transferEvent.args;
        if (from === address) {
          dispatch(
            syncTokenBalanceEpic({ tokenName, accountAddress: address })
          );
          dispatch(
            tokenTransferFromEvent(tokenName, address, transferEvent, false)
          );
        } else if (to === address) {
          dispatch(
            syncTokenBalanceEpic({ tokenName, accountAddress: address })
          );
          dispatch(
            tokenTransferToEvent(tokenName, address, transferEvent, false)
          );
        }
      });
    subscriptionsMap = subscriptionsMap.set(tokenName, subscription);
  });
  registerAccountSpecificSubscriptions({
    tokenTransferEventSubs: subscriptionsMap
  });
  dispatch(subscribeTokenTransfersEvents$.fulfilled());
};

const setAllowance = createAction(
  "BALANCES/SET_ALLOWANCE",
  (
    tokenName,
    spenderAddress,
    newAllowance,
    gasPrice = DEFAULT_GAS_PRICE
  ) =>
    getTokenContractInstance(tokenName).approve(spenderAddress, newAllowance, {
      gasPrice,
    })
);

const setTokenTrustAddressEnabled = createAction(
  "BALANCES/SET_TOKEN_TRUST_ADDRESS_ENABLED",
  (
    tokenName,
    spenderAddress,
    gasLimit = DEFAULT_GAS_LIMIT,
    gasPrice = DEFAULT_GAS_PRICE
  ) =>
    getTokenContractInstance(tokenName).approve(spenderAddress, -1, {
      gasPrice,
    })
);

const setTokenTrustAddressDisabled = createAction(
  "BALANCES/SET_TOKEN_TRUST_ADDRESS_DISABLED",
  (
    tokenName,
    spenderAddress,
    gasPrice = DEFAULT_GAS_PRICE
  ) =>
    getTokenContractInstance(tokenName).approve(
      spenderAddress,
      TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED_MIN_MAX,
      {
        gasPrice,
      }
    )
);

const getAccountTokenAllowanceForAddress = createAction(
  "BALANCES/GET_ACCOUNT_TOKEN_ALLOWANCE_FOR_ADDRESS",
  async (tokenName, account, spenderAddress) =>
    getTokenContractInstance(tokenName).allowance(account, spenderAddress)
);

const getDefaultAccountTokenAllowanceForAddressAction = createAction(
  "BALANCES/GET_DEFAULT_ACCOUNT_TOKEN_ALLOWANCE_FOR_ADDRESS",
  (tokenName, spenderAddress, defaultAccountAddress) =>
    getTokenContractInstance(tokenName).allowance(
      defaultAccountAddress,
      spenderAddress
    ),
  (tokenName, spenderAddress) => ({ tokenName, spenderAddress })
);

const getDefaultAccountTokenAllowanceForAddress = (
  tokenName,
  spenderAddress
) => (dispatch, getState) =>
  dispatch(
    getDefaultAccountTokenAllowanceForAddressAction(
      tokenName,
      spenderAddress,
      accounts.defaultAccount(getState())
    )
  );

//TODO: what is it for? no side efects?
const getDefaultAccountTokenAllowanceForMarketAction = createAction(
  "BALANCES/GET_DEFAULT_ACCOUNT_TOKEN_ALLOWANCE_FOR_ADDRESS",
  (tokenName, defaultAccountAddress) =>
    getTokenContractInstance(tokenName).allowance(
      defaultAccountAddress,
      getMarketContractInstance().address
    ),
  tokenName => ({
    tokenName,
    spenderAddress: getMarketContractInstance().address
  })
);

const getDefaultAccountTokenAllowanceForMarket = tokenName => (
  dispatch,
  getState
) =>
  dispatch(
    getDefaultAccountTokenAllowanceForMarketAction(
      tokenName,
      accounts.defaultAccount(getState())
    )
  );

const setTokenAllowanceTrustStatus$ = createPromiseActions(
  "BALANCES/SET_TOKEN_ALLOWANCE_TRUST_STATUS"
);
const setTokenAllowanceTrustEpic = (
  { tokenName, newAllowanceTrustStatus, allowanceSubjectAddress },
  withCallbacks = {},
  {
    defaultAccount = accounts.defaultAccount,
    tokenAllowanceTrustStatus = balances.tokenAllowanceTrustStatus,
    getErc20Tokens = tokens.getErc20Tokens,
    handleTrans = handleTransaction
  } = {}
) => (dispatch, getState) => {
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

const setLatestBalancesSyncBlockNumber = createAction(
  "BALANCES/LATEST_BALANCES_SYNC_BLOCK_NUMBER"
);
const setLatestBalancesSyncBlockNumberEpic = () => (dispatch, getState) => {
  const latestBlockNumber = network.latestBlockNumber(getState());
  if (latestBlockNumber) {
    dispatch(setLatestBalancesSyncBlockNumber(latestBlockNumber.toString()));
  } else {
    console.warn(
      "setLatestBalancesSyncBlockNumberEpic => Latest block not set yet!"
    );
  }
};

const setLatestBalancesSyncTimestamp = createAction(
  "BALANCES/LATEST_BALANCES_SYNC_TIMESTAMP",
  () => getTimestamp()
);

const actions = {
  Init,
  getDefaultAccountEthBalance,
  getAllTradedTokensBalances,
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
  setTokenTrustAddressEnabled,
  syncTokenBalanceEpic
};

const reducer = handleActions(
  {
    [fulfilled(getDefaultAccountEthBalance)]: (state, { payload }) =>
      state.set("ethBalance", payload.toString()),
    [fulfilled(getAllTradedTokensBalances)]: (state, { payload }) => {
      return state.update("tokenBalances", balances => {
        Object.entries(payload).forEach(([tokenName, tokenBalance]) => {
          balances = balances.set(
            tokenName,
            tokenBalance ? tokenBalance.toString() : null
          );
        });
        return balances;
      });
    },
    [fulfilled(getDefaultAccountTokenAllowanceForAddressAction)]: (
      state,
      { payload, meta: { tokenName, spenderAddress } }
    ) => state.setIn(["tokenAllowances", tokenName, spenderAddress], payload),
    [fulfilled(getDefaultAccountTokenAllowanceForMarketAction)]: (
      state,
      { payload, meta: { tokenName, spenderAddress } }
    ) => state.setIn(["tokenAllowances", tokenName, spenderAddress], payload),
    [tokenTransferFromEvent]: (
      state,
      { payload: { tokenName, event, shouldUpdateBalance } }
    ) => {
      return shouldUpdateBalance
        ? state.updateIn(["tokenBalances", tokenName], balance => {
            return new BigNumber(balance).sub(event.args.value).toString();
          })
        : state;
    },
    [tokenTransferToEvent]: (
      state,
      { payload: { tokenName, event, shouldUpdateBalance } }
    ) => {
      return shouldUpdateBalance
        ? state.updateIn(["tokenBalances", tokenName], balance => {
            return new BigNumber(balance).add(event.args.value).toString();
          })
        : state;
    },

    [etherBalanceChanged]: (state, { payload }) =>
      state.update("ethBalance", () => payload.toString()),

    [updateTokenBalance]: (state, { payload: { tokenName, tokenBalance } }) => {
      return state.setIn(["tokenBalances", tokenName], tokenBalance.toString());
    },
    [setLatestBalancesSyncBlockNumber]: (state, { payload }) =>
      state.set("latestBalancesSyncBlockNumber", payload),
    [setLatestBalancesSyncTimestamp]: (state, { payload }) =>
      state.set("latestBalancesSyncTimestamp", payload)
  },
  initialState
);

export default {
  actions,
  reducer
};
