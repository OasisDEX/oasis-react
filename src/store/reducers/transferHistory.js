import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import accounts from '../selectors/accounts';
import { createPromiseActions } from '../../utils/createPromiseActions';
import period from '../../utils/period';
import network from '../selectors/network';
import networkReducer from './network';
import { getTokenContractInstance } from '../../bootstrap/contracts';

const initialState = fromJS({
  tokensLoadingStatus: {},
  transferHistory: []
});

const transferHistoryItemInitialValue = fromJS({
  status: null
});

const Init = createAction(
  'TRANSFER_HISTORY/INIT',
  () => null,
);

export const TRANSFER_HISTORY_LOAD_STATUS_PENDING =   'TRANSFER_HISTORY/LOAD_STATUS_PENDING';
export const TRANSFER_HISTORY_LOAD_STATUS_COMPLETED = 'TRANSFER_HISTORY/LOAD_STATUS_COMPLETED';
export const TRANSFER_HISTORY_LOAD_STATUS_PAUSED =    'TRANSFER_HISTORY/LOAD_STATUS_STOPPED';
export const TRANSFER_HISTORY_TYPE_TRANSFER_FROM =    'TRANSFER_HISTORY/TYPE_TRANSFER_FROM';
export const TRANSFER_HISTORY_TYPE_TRANSFER_TO =      'TRANSFER_HISTORY/TYPE_TRANSFER_TO';

const tokenTransferEvent = createAction(
  'TRANSFER_HISTORY/EVENT___TOKEN_TRANSFER',
  (tokenName, transactionHash, userAddress, event, blockInfo, transferType) =>
    ({ tokenName, userAddress, event, blockInfo, transferType }),
);

const loadTokenTransfersHistory = createPromiseActions(
  'TRANSFER_HISTORY/LOAD_TOKEN_TRANSFER_HISTORY',
);

const loadingTokenTransferHistorySetPending = createAction(
  'TRANSFER_HISTORY/LOADING_TOKEN_TRANSFER_HISTORY_SET_PENDING'
);

const loadingTokenTransferHistorySetPaused = createAction(
  'TRANSFER_HISTORY/LOADING_TOKEN_TRANSFER_HISTORY_SET_PAUSED'
);

const loadingTokenTransferHistorySetCompleted = createAction(
  'TRANSFER_HISTORY/LOADING_TOKEN_TRANSFER_HISTORY_SET_COMPLETED'
);

const loadTokenTransfersHistoryEpic = (tokenName, address, config) => async (dispatch, getState) => {
  dispatch(loadTokenTransfersHistory.pending());

  const filterAddress = address || accounts.defaultAccount(getState());
  const tokenContract = getTokenContractInstance(tokenName);

  const fromBlock = network.latestBlockNumber(getState()) - period.avgBlockPerActivePeriod();
  const toBlock = 'latest';

  const filterConfig = config ? config : { fromBlock, toBlock };

  const handleTransferEvent = (transferType) =>  async (err, transferEvent) => {
    const blockInfo = (
      await dispatch(networkReducer.actions.getBlock(transferEvent.blockNumber))
    ).value;
    dispatch(tokenTransferEvent(tokenName, transferEvent.transactionHash, filterAddress, transferEvent, blockInfo, transferType));
  };

  tokenContract.Transfer({ from: filterAddress }, filterConfig)
    .then(handleTransferEvent(TRANSFER_HISTORY_TYPE_TRANSFER_FROM));

  tokenContract.Transfer({ to: filterAddress }, filterConfig)
    .then(handleTransferEvent(TRANSFER_HISTORY_TYPE_TRANSFER_TO));

  dispatch(loadingTokenTransferHistorySetPending(tokenName));
};


const actions = {
  Init,
  loadTokenTransfersHistoryEpic
};

const reducer = handleActions({
  [tokenTransferEvent]: (state, { payload: { tokenName, event, blockInfo, transferType} }) =>  {
    const { from, to, value } = event.args;
    return state.update('transferHistory', thList => thList.push(
      fromJS({
        tokenName,
        transferType,
        fromAddress: from,
        toAddress: to,
        timestamp: blockInfo.timestamp,
        tokenAmount: value.toString(),
        transactionHash: event.transactionHash,
        action: transferType === TRANSFER_HISTORY_TYPE_TRANSFER_FROM ? 'out': 'in'
      }))
    );
  },
  [loadingTokenTransferHistorySetPending]: (state, { payload }) =>
    state.setIn(
      ['tokensLoadingStatus', payload],
      transferHistoryItemInitialValue.set('status', TRANSFER_HISTORY_LOAD_STATUS_PENDING)
    ),
  [loadingTokenTransferHistorySetPaused]: (state, { payload }) =>
    state.setIn(
      ['tokensLoadingStatus', payload],
      transferHistoryItemInitialValue.set('status', TRANSFER_HISTORY_LOAD_STATUS_PAUSED)
    ),
  [loadingTokenTransferHistorySetCompleted]: (state, { payload }) =>
    state.setIn(
      ['tokensLoadingStatus', payload],
      transferHistoryItemInitialValue.set('status', TRANSFER_HISTORY_LOAD_STATUS_COMPLETED)
    ),

}, initialState);

export default {
  actions,
  reducer,
};
