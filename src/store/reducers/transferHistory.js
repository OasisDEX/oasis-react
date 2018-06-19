import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import accounts from "../selectors/accounts";
import { createPromiseActions } from "../../utils/createPromiseActions";
import period from "../../utils/period";
import network from "../selectors/network";
import networkReducer from "./network";
import { getTokenContractInstance } from "../../bootstrap/contracts";
import { registerAccountSpecificSubscriptions } from "../../bootstrap/web3";
import transferHistory from "../selectors/transferHistory";
import { convertTo18Precision } from '../../utils/conversion';

const initialState = fromJS({
  tokensLoadingStatus: {},
  transferHistory: {},
  historyLoadedForAddress: {}
});

const transferHistoryItemInitialValue = fromJS({
  status: null
});

const Init = createAction("TRANSFER_HISTORY/INIT", () => null);

export const TRANSFER_HISTORY_LOAD_STATUS_PENDING =
  "TRANSFER_HISTORY/LOAD_STATUS_PENDING";
export const TRANSFER_HISTORY_LOAD_STATUS_INITIALLY_LOADED =
  "TRANSFER_HISTORY/LOAD_STATUS_INITIALLY_LOADED";
export const TRANSFER_HISTORY_LOAD_STATUS_COMPLETED =
  "TRANSFER_HISTORY/LOAD_STATUS_COMPLETED";
export const TRANSFER_HISTORY_LOAD_STATUS_PAUSED =
  "TRANSFER_HISTORY/LOAD_STATUS_STOPPED";
export const TRANSFER_HISTORY_TYPE_TRANSFER_FROM =
  "TRANSFER_HISTORY/TYPE_TRANSFER_FROM";
export const TRANSFER_HISTORY_TYPE_TRANSFER_TO =
  "TRANSFER_HISTORY/TYPE_TRANSFER_TO";

const tokenTransferEvent = createAction(
  "TRANSFER_HISTORY/EVENT___TOKEN_TRANSFER",
  (
    tokenName,
    transactionHash,
    userAddress,
    event,
    blockInfo,
    transferType,
    accountAddress
  ) => ({
    tokenName,
    userAddress,
    event,
    blockInfo,
    transferType,
    accountAddress
  })
);

const initializeAccountList = createAction(
  "TRANSFER_HISTORY/INITIALIZE_ACCOUNT_LIST"
);

const loadTokenTransfersHistory = createPromiseActions(
  "TRANSFER_HISTORY/LOAD_TOKEN_TRANSFER_HISTORY"
);

const loadingTokenTransferHistorySetPending = createAction(
  "TRANSFER_HISTORY/LOADING_TOKEN_TRANSFER_HISTORY_SET_PENDING"
);

const loadingTokenTransferHistorySetPaused = createAction(
  "TRANSFER_HISTORY/LOADING_TOKEN_TRANSFER_HISTORY_SET_PAUSED"
);

const loadingTokenTransferHistorySetCompleted = createAction(
  "TRANSFER_HISTORY/LOADING_TOKEN_TRANSFER_HISTORY_SET_COMPLETED"
);

// const setInitialHistoryBlockForAccount = createAction(
//   "TRANSFER_HISTORY/SET_INITIAL_TRANSFER_HISTORY_FOR_ACCOUNT"
// );
const loadTokenTransfersHistoryEpic = (tokenName, address, config) => async (
  dispatch,
  getState
) => {
  const defaultAccount = accounts.defaultAccount(getState());
  if (false === transferHistory.hasAccountEntry(getState(), defaultAccount)) {
    dispatch(initializeAccountList(defaultAccount));
  } else if (
    transferHistory.getTokenTransferHistoryStatus(getState(), tokenName)
  ) {
    return;
  }
  dispatch(loadTokenTransfersHistory.pending());
  dispatch(loadingTokenTransferHistorySetPending(tokenName));

  const filterAddress = address || defaultAccount;
  const tokenContract = getTokenContractInstance(tokenName);

  const fromBlock =
    network.latestBlockNumber(getState()) - period.avgBlockPerActivePeriod();
  const toBlock = "latest";

  const filterConfig = config ? config : { fromBlock, toBlock };

  const handleTransferEvent = transferType => async (err, transferEvent) => {
    const blockInfo = (await dispatch(
      networkReducer.actions.getBlock(transferEvent.blockNumber)
    )).value;
    dispatch(
      tokenTransferEvent(
        tokenName,
        transferEvent.transactionHash,
        filterAddress,
        transferEvent,
        blockInfo,
        transferType,
        defaultAccount
      )
    );
  };

  registerAccountSpecificSubscriptions({
    transferHistoryEventSub: {
      key: `(${tokenName}):Transfer=>from`,
      value: tokenContract
        .Transfer({ from: filterAddress }, filterConfig)
        .then(handleTransferEvent(TRANSFER_HISTORY_TYPE_TRANSFER_FROM))
    }
  });
  registerAccountSpecificSubscriptions({
    transferHistoryEventSub: {
      key: `(${tokenName}):Transfer=>to`,
      value: tokenContract
        .Transfer({ to: filterAddress }, filterConfig)
        .then(handleTransferEvent(TRANSFER_HISTORY_TYPE_TRANSFER_TO))
    }
  });
  dispatch(loadingTokenTransferHistorySetCompleted(tokenName));
};

const actions = {
  Init,
  loadTokenTransfersHistoryEpic
};

const reducer = handleActions(
  {
    [initializeAccountList]: (state, { payload }) => {
      return state.setIn(["transferHistory", payload], fromJS([]));
    },
    [tokenTransferEvent]: (
      state,
      { payload: { tokenName, event, blockInfo, transferType, accountAddress } }
    ) => {
      const { from, to, value } = event.args;
      return state.updateIn(["transferHistory", accountAddress], thList =>
        thList.push(
          fromJS({
            tokenName,
            transferType,
            fromAddress: from,
            toAddress: to,
            timestamp: blockInfo.timestamp,
            tokenAmount: convertTo18Precision(value.toString(), tokenName),
            transactionHash: event.transactionHash,
            action:
              transferType === TRANSFER_HISTORY_TYPE_TRANSFER_FROM
                ? "out"
                : "in"
          })
        )
      );
    },
    [loadingTokenTransferHistorySetPending]: (state, { payload }) =>
      state.setIn(
        ["tokensLoadingStatus", payload],
        transferHistoryItemInitialValue.set(
          "status",
          TRANSFER_HISTORY_LOAD_STATUS_PENDING
        )
      ),
    [loadingTokenTransferHistorySetPaused]: (state, { payload }) =>
      state.setIn(
        ["tokensLoadingStatus", payload],
        transferHistoryItemInitialValue.set(
          "status",
          TRANSFER_HISTORY_LOAD_STATUS_PAUSED
        )
      ),
    [loadingTokenTransferHistorySetCompleted]: (state, { payload }) =>
      state.setIn(
        ["tokensLoadingStatus", payload],
        transferHistoryItemInitialValue.set(
          "status",
          TRANSFER_HISTORY_LOAD_STATUS_COMPLETED
        )
      )
  },
  initialState
);

export default {
  actions,
  reducer
};
