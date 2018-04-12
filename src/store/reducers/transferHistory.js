import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import accounts from '../selectors/accounts';
import { createPromiseActions } from '../../utils/createPromiseActions';
import getTokenContractInstance from '../../utils/contracts/getContractInstance';
import period from '../../utils/period';
import network from '../selectors/network';
import networkReducer from './network';

const initialState = fromJS({
  tokensLoadingStatus: {},
  transferHistory: []
});

const transferHistoryItemInitialValue = fromJS({
  status: null
});

const INIT = 'TRANSFER_HISTORY/INIT';

const Init = createAction(
  INIT,
  () => null,
);

const createHistoryEntry = ({ transactionHash, tokenName, fromAddress, toAddress, tokenAmount, timestamp, blockNumber, transferType }) =>
  fromJS({
    tokenName,
    fromAddress,
    toAddress,
    tokenAmount,
    timestamp,
    blockNumber,
    transferType,
    transactionHash,
    action: transferType === TRANSFER_HISTORY_TYPE_TRANSFER_FROM ? 'out': 'in'
  });

export const TRANSFER_HISTORY_LOAD_STATUS_PENDING =   'TRANSFER_HISTORY/LOAD_STATUS_PENDING';
export const TRANSFER_HISTORY_LOAD_STATUS_COMPLETED = 'TRANSFER_HISTORY/LOAD_STATUS_COMPLETED';
export const TRANSFER_HISTORY_LOAD_STATUS_PAUSED =    'TRANSFER_HISTORY/LOAD_STATUS_STOPPED';
export const TRANSFER_HISTORY_TYPE_TRANSFER_FROM =    'TRANSFER_HISTORY/TYPE_TRANSFER_FROM';
export const TRANSFER_HISTORY_TYPE_TRANSFER_TO =      'TRANSFER_HISTORY/TYPE_TRANSFER_TO';


const tokenTransferFromEvent = createAction(
  'TRANSFER_HISTORY/EVENT___TOKEN_TRANSFER_FROM',
  (tokenName, transactionHash, userAddress, event, blockInfo) =>
    ({ tokenName, userAddress, event, blockInfo }),
);

const tokenTransferToEvent = createAction(
  'TRANSFER_HISTORY/EVENT___TOKEN_TRANSFER_TO',
  (tokenName, transactionHash, userAddress, event, blockInfo) =>
    ({ tokenName, userAddress, event, blockInfo }),
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
  tokenContract.Transfer({ from: filterAddress }, filterConfig)
    .then(
      async (err, transferEvent) => {
        const blockInfo = (
          await dispatch(networkReducer.actions.getBlock(transferEvent.blockNumber))
        ).value;
        dispatch(tokenTransferFromEvent(tokenName,transferEvent.transactionHash, filterAddress, transferEvent, blockInfo));
      },
    );

  tokenContract.Transfer({ from: filterAddress }, filterConfig)
    .then(
      async (err, transferEvent) => {
        const blockInfo = (
          await dispatch(networkReducer.actions.getBlock(transferEvent.blockNumber))
        ).value;
        dispatch(tokenTransferToEvent(tokenName, transferEvent.transactionHash, filterAddress, transferEvent, blockInfo));
      },
    );

  dispatch(loadingTokenTransferHistorySetPending(tokenName));
};


const actions = {
  Init,
  loadTokenTransfersHistoryEpic
};

const reducer = handleActions({
  [tokenTransferFromEvent]: (state, { payload: { tokenName, event, blockInfo } }) =>  {
    const { from, to, value } = event.args;
    return state.update('transferHistory', thList => thList.push(
      createHistoryEntry({
        tokenName,
        transferType: TRANSFER_HISTORY_TYPE_TRANSFER_FROM,
        fromAddress: from,
        toAddress: to,
        timestamp: blockInfo.timestamp,
        tokenAmount: value.toString(),
        transactionHash: event.transactionHash,
      }))
    );
  },
  [tokenTransferToEvent]: (state, { payload: { tokenName, event, blockInfo } }) => {
    const { from, to, value } = event.args;
    return state.update('transferHistory', thList => thList.push(
      createHistoryEntry({
        tokenName,
        transferType: TRANSFER_HISTORY_TYPE_TRANSFER_TO,
        fromAddress: from,
        toAddress: to,
        timestamp: blockInfo.timestamp,
        tokenAmount: value.toString(),
        transactionHash: event.transactionHash,
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
