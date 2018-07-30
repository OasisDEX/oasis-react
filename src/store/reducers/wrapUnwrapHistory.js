import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import accounts from "../selectors/accounts";
const { market: marketConfig } = require("./../../../src/configs");
import { createPromiseActions } from "../../utils/createPromiseActions";
import period from "../../utils/period";
import network from "../selectors/network";
import networkReducer from "./network";
import {
  TOKEN_ETHER,
  TOKEN_GOLEM,
  TOKEN_WRAPPED_ETH,
  TOKEN_WRAPPED_GNT
} from "../../constants";
import wrapUnwrap from "../selectors/wrapUnwrap";
import balancesReducer from "./balances";
import createHistoryEntry from "../../utils/wrapUnwrapHistory/createHistoryEntry";
import { getTokenContractInstance } from "../../bootstrap/contracts";
import { registerAccountSpecificSubscriptions } from "../../bootstrap/web3";
import wrapUnwrapHistory from "../selectors/wrapUnwrapHistory";

const initialState = fromJS({
  historyLoadingStatus: null,
  wrapUnwrapHistory: {}
});

const INIT = "WRAP_UNWRAP_HISTORY/INIT";

const init = createAction(INIT, () => null);

export const WRAP_UNWRAP_HISTORY_LOAD_STATUS_PENDING =
  "WRAP_UNWRAP_HISTORY/LOAD_STATUS_PENDING";
export const WRAP_UNWRAP_HISTORY_LOAD_STATUS_LOAD_STATUS_INITIALLY_LOADED =
  "WRAP_UNWRAP_HISTORY/LOAD_STATUS_INITIALLY_LOADED";
export const WRAP_UNWRAP_HISTORY_LOAD_STATUS_COMPLETED =
  "WRAP_UNWRAP_HISTORY/LOAD_STATUS_COMPLETED";
export const WRAP_UNWRAP_HISTORY_LOAD_STATUS_PAUSED =
  "WRAP_UNWRAP_HISTORY/LOAD_STATUS_STOPPED";

export const WRAP_UNWRAP_HISTORY_TYPE_WRAP = "WRAP_UNWRAP_HISTORY/TYPE_WRAP";
export const WRAP_UNWRAP_HISTORY_TYPE_UNWRAP =
  "WRAP_UNWRAP_HISTORY/TYPE_UNWRAP";

const tokenWrapEvent = createAction(
  "WRAP_UNWRAP_HISTORY/EVENT___TOKEN_WRAP",
  (tokenName, transactionHash, userAddress, event, blockInfo) => ({
    tokenName,
    userAddress,
    event,
    blockInfo
  })
);

const tokenUnwrapEvent = createAction(
  "WRAP_UNWRAP_HISTORY/EVENT___TOKEN_UNWRAP",
  (tokenName, transactionHash, userAddress, event, blockInfo) => ({
    tokenName,
    userAddress,
    event,
    blockInfo
  })
);

const loadingWrapUnwrapHistorySetPending = createAction(
  "WRAP_UNWRAP_HISTORY/LOADING_WRAP_UNWRAP_HISTORY_SET_PENDING"
);

const loadingWrapUnwrapHistorySetInitiallyLoaded = createAction(
  "WRAP_UNWRAP_HISTORY/LOADING_WRAP_UNWRAP_HISTORY_SET_INITIALLY_LOADED"
);

const loadingWrapUnwrapHistorySetPaused = createAction(
  "WRAP_UNWRAP_HISTORY/LOADING_WRAP_UNWRAP_HISTORY_SET_PAUSED"
);

const loadingWrapUnwrapHistorySetCompleted = createAction(
  "WRAP_UNWRAP_HISTORY/LOADING_WRAP_UNWRAP_HISTORY_SET_COMPLETED"
);

const loadWrapUnwrapsHistory$ = createPromiseActions(
  "WRAP_UNWRAP_HISTORY/LOAD_WRAP_UNWRAP_HISTORY"
);

const initializeAccountList = createAction(
  "WRAP_UNWRAP_HISTORY/INITIALIZE_ACCOUNT_LIST"
);

const loadEtherWrapUnwrapsHistoryEpic = (address, config) => async (
  dispatch,
  getState
) => {
  dispatch(loadWrapUnwrapsHistory$.pending());
  const tokenName = TOKEN_ETHER;
  const filterAddress = address || accounts.defaultAccount(getState());
  const tokenContract = getTokenContractInstance(TOKEN_WRAPPED_ETH);
  const currentLatestBlock = network.latestBlockNumber(getState());
  const activeMarketConfig =
    marketConfig[network.activeNetworkName(getState())];
  const fromBlock = activeMarketConfig
    ? marketConfig[network.activeNetworkName(getState())].blockNumber
    : currentLatestBlock - period.avgBlockPerDefaultPeriod();
  const toBlock = "latest";

  const filterConfig = config ? config : { fromBlock, toBlock };

  registerAccountSpecificSubscriptions({
    wrapUnwrapHistoryEventSub: {
      key: `(${tokenName}):Deposit`,
      value: tokenContract
        .Deposit({ who: filterAddress }, filterConfig)
        .then(async (err, ethWrapEvent) => {
          const blockInfo = (await dispatch(
            networkReducer.actions.getBlock(ethWrapEvent.blockNumber)
          )).value;

          if (ethWrapEvent.blockNumber > currentLatestBlock) {
            const { amount } = ethWrapEvent.args;
            dispatch(
              balancesReducer.actions.tokenTransferToEvent(
                TOKEN_WRAPPED_ETH,
                filterAddress,
                { args: { from: filterAddress, value: amount } },
                false
              )
            );
          }
          dispatch(
            tokenWrapEvent(
              tokenName,
              ethWrapEvent.transactionHash,
              filterAddress,
              ethWrapEvent,
              blockInfo
            )
          );
        })
    }
  });
  registerAccountSpecificSubscriptions({
    wrapUnwrapHistoryEventSub: {
      key: `(${tokenName}):Withdrawal`,
      value: tokenContract
        .Withdrawal({ who: filterAddress }, filterConfig)
        .then(async (err, ethUnwrapEvent) => {
          const blockInfo = (await dispatch(
            networkReducer.actions.getBlock(ethUnwrapEvent.blockNumber)
          )).value;

          if (ethUnwrapEvent.blockNumber > currentLatestBlock) {
            const { amount } = ethUnwrapEvent.args;
            dispatch(
              balancesReducer.actions.tokenTransferFromEvent(
                TOKEN_WRAPPED_ETH,
                filterAddress,
                { args: { from: filterAddress, value: amount } },
                false
              )
            );

            dispatch(balancesReducer.actions.getDefaultAccountEthBalance());
          }
          dispatch(
            tokenUnwrapEvent(
              tokenName,
              ethUnwrapEvent.transactionHash,
              filterAddress,
              ethUnwrapEvent,
              blockInfo
            )
          );
        })
    }
  });

  dispatch(loadWrapUnwrapsHistory$.fulfilled());
};

// eslint-disable-next-line no-unused-vars
const loadGNTWrapUnwrapsHistoryEpic = (address, config) => async (
  dispatch,
  getState
) => {
  const tokenName = TOKEN_GOLEM;

  const filterAddress = address || accounts.defaultAccount(getState());
  const tokenContract = getTokenContractInstance(tokenName);
  const WGNTContract = getTokenContractInstance(TOKEN_WRAPPED_GNT);

  const GNTBrokerAddress = wrapUnwrap.getBrokerAddress(getState(), tokenName);

  const currentLatestBlock = network.latestBlockNumber(getState());
  const fromBlock = currentLatestBlock - period.avgBlockPerActivePeriod();
  const toBlock = "latest";
  const filterConfig = config ? config : { fromBlock, toBlock };

  registerAccountSpecificSubscriptions({
    wrapUnwrapHistoryEventSub: {
      key: `(${tokenName}):Transfer:GNTBroker=>WGNTContract`,
      value: tokenContract
        .Transfer(
          { from: GNTBrokerAddress, to: WGNTContract.address },
          { fromBlock }
        )
        .then(async (err, wrapUnwrapEvent) => {
          const blockInfo = (await dispatch(
            networkReducer.actions.getBlock(wrapUnwrapEvent.blockNumber)
          )).value;

          if (wrapUnwrapEvent.blockNumber > currentLatestBlock) {
            const { value } = wrapUnwrapEvent.args;
            dispatch(
              balancesReducer.actions.tokenTransferToEvent(
                TOKEN_WRAPPED_GNT,
                filterAddress,
                { args: { to: filterAddress, value } },
                false
              )
            );
            dispatch(
              balancesReducer.actions.syncTokenBalanceEpic({
                tokenName: TOKEN_WRAPPED_GNT,
                accountAddress: filterAddress
              })
            );
          }

          dispatch(
            tokenWrapEvent(
              tokenName,
              wrapUnwrapEvent.transactionHash,
              filterAddress,
              wrapUnwrapEvent,
              blockInfo
            )
          );
        })
    }
  });

  registerAccountSpecificSubscriptions({
    wrapUnwrapHistoryEventSub: {
      key: `(${tokenName}):Transfer:WGNTContract=>UserAccount`,
      value: tokenContract
        .Transfer(
          { from: WGNTContract.address, to: filterAddress },
          filterConfig
        )
        .then(async (err, wrapUnwrapEvent) => {
          const blockInfo = (await dispatch(
            networkReducer.actions.getBlock(wrapUnwrapEvent.blockNumber)
          )).value;

          if (wrapUnwrapEvent.blockNumber > currentLatestBlock) {
            dispatch(
              balancesReducer.actions.syncTokenBalanceEpic({
                tokenName: TOKEN_WRAPPED_GNT,
                accountAddress: filterAddress
              })
            );
            dispatch(
              balancesReducer.actions.syncTokenBalanceEpic({
                tokenName: TOKEN_GOLEM,
                accountAddress: filterAddress
              })
            );
          }
          dispatch(
            tokenUnwrapEvent(
              tokenName,
              wrapUnwrapEvent.transactionHash,
              filterAddress,
              wrapUnwrapEvent,
              blockInfo
            )
          );
        })
    }
  });
};

const loadWrapUnwrapsHistoryEpic = () => (dispatch, getState) => {
  const defaultAccount = accounts.defaultAccount(getState());
  dispatch(loadingWrapUnwrapHistorySetPending());
  if (false === wrapUnwrapHistory.hasAccountEntry(getState(), defaultAccount)) {
    dispatch(initializeAccountList(defaultAccount));
  } else {
    return;
  }
  dispatch(loadEtherWrapUnwrapsHistoryEpic());
  // dispatch(loadGNTWrapUnwrapsHistoryEpic());
  dispatch(loadingWrapUnwrapHistorySetInitiallyLoaded());
};

const actions = {
  init,
  loadWrapUnwrapsHistoryEpic
};

const reducer = handleActions(
  {
    [initializeAccountList]: (state, { payload }) =>
      state.setIn(["wrapUnwrapHistory", payload], fromJS([])),
    [tokenWrapEvent]: (
      state,
      { payload: { tokenName, event, blockInfo, userAddress } }
    ) => {
      const wrapHistoryEntry = createHistoryEntry({
        event,
        tokenName,
        wrapUnwrapType: WRAP_UNWRAP_HISTORY_TYPE_WRAP,
        timestamp: blockInfo.timestamp,
        transactionHash: event.transactionHash
      });
      return state.updateIn(["wrapUnwrapHistory", userAddress], whList =>
        whList.push(wrapHistoryEntry)
      );
    },
    [tokenUnwrapEvent]: (
      state,
      { payload: { tokenName, event, blockInfo, userAddress } }
    ) => {
      const unwrapHistoryEntry = createHistoryEntry({
        event,
        tokenName,
        wrapUnwrapType: WRAP_UNWRAP_HISTORY_TYPE_UNWRAP,
        timestamp: blockInfo.timestamp,
        transactionHash: event.transactionHash
      });
      return state.updateIn(["wrapUnwrapHistory", userAddress], whList =>
        whList.push(unwrapHistoryEntry)
      );
    },
    [loadingWrapUnwrapHistorySetPending]: state =>
      state.set(
        "historyLoadingStatus",
        WRAP_UNWRAP_HISTORY_LOAD_STATUS_PENDING
      ),
    [loadingWrapUnwrapHistorySetInitiallyLoaded]: state =>
      state.set(
        "historyLoadingStatus",
        WRAP_UNWRAP_HISTORY_LOAD_STATUS_LOAD_STATUS_INITIALLY_LOADED
      ),
    [loadingWrapUnwrapHistorySetPaused]: state =>
      state.set("historyLoadingStatus", WRAP_UNWRAP_HISTORY_LOAD_STATUS_PAUSED),
    [loadingWrapUnwrapHistorySetCompleted]: state =>
      state.set(
        "historyLoadingStatus",
        WRAP_UNWRAP_HISTORY_LOAD_STATUS_COMPLETED
      )
  },
  initialState
);

export default {
  actions,
  reducer
};
