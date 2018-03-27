import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import accounts from '../selectors/accounts';
import { createPromiseActions } from '../../utils/createPromiseActions';
import getTokenContractInstance from '../../utils/contracts/getContractInstance';
import period from '../../utils/period';
import network from '../selectors/network';
import networkReducer from './network';
import { TOKEN_ETHER, TOKEN_GNOSIS, TOKEN_WRAPPED_ETH, TOKEN_WRAPPED_GNT } from '../../constants';
import wrapUnwrap from '../selectors/wrapUnwrap';

const initialState = fromJS({
  historyLoadingStatus: null,
  wrapUnwrapHistory: []
});

const INIT = 'WRAP_UNWRAP_HISTORY/INIT';

const Init = createAction(
  INIT,
  () => null,
);

const createHistoryEntry = ({ event, transactionHash, tokenName, timestamp, blockNumber, wrapUnwrapType }) => {

  const action  = wrapUnwrapType === WRAP_UNWRAP_HISTORY_TYPE_WRAP ? 'wrap': 'unwrap';
  switch (tokenName) {
    case TOKEN_ETHER: {
      const { who, amount } = event.args;
      return fromJS({
        tokenName,
        fromAddress: who,
        toAddress: null,
        tokenAmount: amount.toString(),
        timestamp,
        blockNumber,
        wrapUnwrapType,
        transactionHash,
        action
      });
    }
    case TOKEN_GNOSIS: {
      const { to, from, value } = event.args;
      return fromJS({
        tokenName,
        fromAddress : from,
        toAddress: to,
        tokenAmount: value.toString(),
        timestamp,
        blockNumber,
        wrapUnwrapType,
        transactionHash,
        action
      });
    }
  }
};

export const WRAP_UNWRAP_HISTORY_LOAD_STATUS_PENDING =   'WRAP_UNWRAP_HISTORY/LOAD_STATUS_PENDING';
export const WRAP_UNWRAP_HISTORY_LOAD_STATUS_COMPLETED = 'WRAP_UNWRAP_HISTORY/LOAD_STATUS_COMPLETED';
export const WRAP_UNWRAP_HISTORY_LOAD_STATUS_PAUSED =    'WRAP_UNWRAP_HISTORY/LOAD_STATUS_STOPPED';

export const WRAP_UNWRAP_HISTORY_TYPE_WRAP =             'WRAP_UNWRAP_HISTORY/TYPE_WRAP';
export const WRAP_UNWRAP_HISTORY_TYPE_UNWRAP =           'WRAP_UNWRAP_HISTORY/TYPE_UNWRAP';


const tokenWrapEvent = createAction(
  'WRAP_UNWRAP_HISTORY/EVENT___TOKEN_WRAP',
  (tokenName, transactionHash, userAddress, event, blockInfo) =>
    ({ tokenName, userAddress, event, blockInfo }),
);

const tokenUnwrapEvent = createAction(
  'WRAP_UNWRAP_HISTORY/EVENT___TOKEN_UNWRAP',
  (tokenName, transactionHash, userAddress, event, blockInfo) =>
    ({ tokenName, userAddress, event, blockInfo }),
);

const loadWrapUnwrapsHistory = createPromiseActions(
  'WRAP_UNWRAP_HISTORY/LOAD_WRAP_UNWRAP_HISTORY',
);

const loadingWrapUnwrapHistorySetPending = createAction(
  'WRAP_UNWRAP_HISTORY/LOADING_WRAP_UNWRAP_HISTORY_SET_PENDING'
);

const loadingWrapUnwrapHistorySetPaused = createAction(
  'WRAP_UNWRAP_HISTORY/LOADING_WRAP_UNWRAP_HISTORY_SET_PAUSED'
);

const loadingWrapUnwrapHistorySetCompleted = createAction(
  'WRAP_UNWRAP_HISTORY/LOADING_WRAP_UNWRAP_HISTORY_SET_COMPLETED'
);



const loadEtherWrapUnwrapsHistoryEpic = (address, config) => async (dispatch, getState) => {

  const tokenName = TOKEN_ETHER;

  const filterAddress = address || accounts.defaultAccount(getState());
  const tokenContract = getTokenContractInstance(TOKEN_WRAPPED_ETH);

  const fromBlock = network.latestBlockNumber(getState()) - period.avgBlockPerActivePeriod();
  const toBlock = 'latest';

  const filterConfig = config ? config : { fromBlock, toBlock };
  tokenContract.Deposit({ who: filterAddress }, filterConfig)
    .then(
      async (err, ethWrapEvent) => {
        const blockInfo = (
          await dispatch(networkReducer.actions.getBlock(ethWrapEvent.blockNumber))
        ).value;
        dispatch(tokenWrapEvent(tokenName, ethWrapEvent.transactionHash, filterAddress, ethWrapEvent, blockInfo));
      },
    );

  tokenContract.Withdrawal({ who: filterAddress }, filterConfig)
    .then(
      async (err, ethUnwrapEvent) => {
        const blockInfo = (
          await dispatch(networkReducer.actions.getBlock(ethUnwrapEvent.blockNumber))
        ).value;
        dispatch(tokenUnwrapEvent(tokenName, ethUnwrapEvent.transactionHash, filterAddress, ethUnwrapEvent, blockInfo));
      },
    );
};




const loadGNTWrapUnwrapsHistoryEpic = (address, config) => async (dispatch, getState) => {

  const tokenName = TOKEN_GNOSIS;

  const filterAddress = address || accounts.defaultAccount(getState());
  const tokenContract = getTokenContractInstance(tokenName);
  const WGNTContract  = getTokenContractInstance(TOKEN_WRAPPED_GNT);

  const GNTBrokerAddress = wrapUnwrap.getBrokerAddress(getState(), tokenName);

  const fromBlock = network.latestBlockNumber(getState()) - period.avgBlockPerActivePeriod();
  const toBlock = 'latest';

  const filterConfig = config ? config : { fromBlock, toBlock };
  tokenContract.Transfer({ from: GNTBrokerAddress, to: WGNTContract.address },{fromBlock: 6523450 - 10000})
    .then(
      async (err, wrapUnwrapEvent) => {
        const blockInfo = (
          await dispatch(networkReducer.actions.getBlock(wrapUnwrapEvent.blockNumber))
        ).value;
        dispatch(tokenWrapEvent(tokenName, wrapUnwrapEvent.transactionHash, filterAddress, wrapUnwrapEvent, blockInfo));
      },
    );

  tokenContract.Transfer({ from: WGNTContract.address, to: filterAddress }, filterConfig)
    .then(
      async (err, wrapUnwrapEvent) => {
        const blockInfo = (
          await dispatch(networkReducer.actions.getBlock(wrapUnwrapEvent.blockNumber))
        ).value;
        dispatch(tokenUnwrapEvent(tokenName, wrapUnwrapEvent.transactionHash, filterAddress, wrapUnwrapEvent, blockInfo));
      },
    );

};


const loadWrapUnwrapsHistoryEpic = () => (dispatch) => {
  dispatch(loadEtherWrapUnwrapsHistoryEpic());
  dispatch(loadGNTWrapUnwrapsHistoryEpic());
  dispatch(loadingWrapUnwrapHistorySetPending());
};

const actions = {
  loadWrapUnwrapsHistoryEpic
};

const reducer = handleActions({
  [tokenWrapEvent]: (state, { payload: { tokenName, event, blockInfo } }) =>  {
    return state.update('wrapUnwrapHistory', whList => whList.push(
      createHistoryEntry({
        event,
        tokenName,
        wrapUnwrapType: WRAP_UNWRAP_HISTORY_TYPE_WRAP,
        timestamp: blockInfo.timestamp,
        transactionHash: event.transactionHash
      }))
    )
  },
  [tokenUnwrapEvent]: (state, { payload: { tokenName, event, blockInfo } }) => {
    return state.update('wrapUnwrapHistory', whList => whList.push(
      createHistoryEntry({
        event,
        tokenName,
        wrapUnwrapType: WRAP_UNWRAP_HISTORY_TYPE_UNWRAP,
        timestamp: blockInfo.timestamp,
        transactionHash: event.transactionHash
      }))
    );
  },
  [loadingWrapUnwrapHistorySetPending]: state =>
    state.set('historyLoadingStatus', WRAP_UNWRAP_HISTORY_LOAD_STATUS_PENDING),
  [loadingWrapUnwrapHistorySetPaused]: state =>
    state.set('historyLoadingStatus', WRAP_UNWRAP_HISTORY_LOAD_STATUS_PAUSED),
  [loadingWrapUnwrapHistorySetCompleted]: state =>
    state.set('historyLoadingStatus', WRAP_UNWRAP_HISTORY_LOAD_STATUS_COMPLETED),
}, initialState);

export default {
  actions,
  reducer,
};
