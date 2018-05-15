/* eslint-disable no-unused-vars */
import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { find } from 'lodash';

import web3, { web3p } from '../../bootstrap/web3';

import { createPromiseActions } from '../../utils/createPromiseActions';
import { fulfilled } from '../../utils/store';
import contractsBootstrap from '../../bootstrap/contracts';
import platformReducer from './platform';
import balancesReducer from './balances';

import marketBootstrap from '../../bootstrap/market';

import { CLOSED, LIVE_NET_ID, ONLINE } from '../../constants';
import tradesReducer from './trades';
import period from '../../utils/period';
import network from '../selectors/network';
import offersReducer from './offers';
import tokens from '../selectors/tokens';
import transactionsReducer from './transactions';
import { HEALTHCHECK_INTERVAL_MS } from '../../index';
import accounts from '../selectors/accounts';

import tokensReducer from './tokens';

const initialState = fromJS(
  {
    status: CLOSED,
    sync: { isPending: false, ts: null },
    activeNetworkName: null,
    activeNetworkId: null,
    latestBlockNumber: null,
    outOfSync: true,
    tokenAddresses: null,
    latestEthereumPrice: null,
  });

const syncNetwork = createPromiseActions(
  'NETWORK/SYNC_NETWORK',
);

// /**
//  * TODO @Arek Revise this logic
//  */
// const syncNetworkEpic = () => async (dispatch, getStore) => {
//   const isNetworkSyncPending = getStore().getIn(['network', 'sync', 'isPending']);
//   dispatch(checkNetworkEpic());
//   web3.eth.isSyncing((error, sync) => {
//     if (!error) {
//       dispatch(sessionReducer.actions.SetValue('syncing', sync !== false));
//       // Stop all app activity
//       if (sync === true) {
//         web3.reset(true);
//         dispatch(checkNetworkEpic());
//         // show sync info
//       } else if (sync) {
//         dispatch(sessionReducer.actions.SetValue('startingBlock', sync.startingBlock));
//         dispatch(sessionReducer.actions.SetValue('currentBlock', sync.currentBlock));
//         dispatch(sessionReducer.actions.SetValue('highestBlock', sync.highestBlock));
//       } else {
//         dispatch(sessionReducer.actions.SetValue('highestBlock', sync.highestBlock));
//         dispatch(sessionReducer.actions.SetValue('outOfSync', false));
//         // offersReducer.actions.Sync();
//         // web3.eth.filter('latest', () => {
//         //   tokensReducer.actions.Sync();
//         //   limitsReducer.actions.Sync();
//         //   transactionsReducer.actions.Sync();
//         // });
//       }
//     }
//   });
// };

const CheckNetworkAction = createPromiseActions('NETWORK/CHECK_NETWORK');

/**
 * @dev We get latest mined block number
 */
const getLatestBlockNumber = createAction(
  'NETWORK_GET_LATEST_BLOCK_NUMBER',
  async () => web3p.eth.getBlockNumber(),
);

const getBlock = createAction(
  'NETWORK_GET_LATEST_BLOCK',
  async (blockNumber) => web3p.eth.getBlock(blockNumber),
);

const getLatestBlock = () => getBlock('latest');

/**
 * @dev Here we create 3 actions for checking the network status
 * @type {{pending, fulfilled, rejected}|*}
 */
const subscribeLatestBlockFilter = createPromiseActions(
  'NETWORK/SUBSCRIBE_LATEST_BLOCK_FILTER',
);

const subscribeLatestBlockFilterEpic = () => async (dispatch, getState) => {
  dispatch(subscribeLatestBlockFilter.pending());

  const update = () => {
    dispatch(getLatestBlockNumber());
    dispatch(fetchEthereumPrice());
    dispatch(transactionsReducer.actions.getCurrentTxNonceEpic());
    dispatch(transactionsReducer.actions.getCurrentGasPrice());
    dispatch(balancesReducer.actions.syncTokenBalances(window.contracts.tokens, accounts.defaultAccount(getState())));
    dispatch(offersReducer.actions.getBestOfferIdsForActiveTradingPairEpic());
    dispatch(tokensReducer.actions.getActiveTradingPairAllowanceStatus());
  };

  const tid = setInterval(() => {
    update();
  }, HEALTHCHECK_INTERVAL_MS);

  web3.eth.filter('latest', (e, b) => {
    clearInterval(tid);
    update();
  });

  dispatch(subscribeLatestBlockFilter.fulfilled());
  return subscribeLatestBlockFilter;
};

const onNetworkCheckCompleted = (dispatch, getState) =>  async () => {
  const currentLatestBlock = network.latestBlockNumber(getState());
  dispatch(tokensReducer.actions.getActiveTradingPairAllowanceStatus());
  dispatch(subscribeLatestBlockFilterEpic());

  // Inital offersReducer sync
  dispatch(offersReducer.actions.subscribeOffersEventsEpic());

  const tradingPair = tokens.activeTradingPair(getState()) || tokens.defaultTradingPair(getState()).toJSON();
  dispatch(offersReducer.actions.syncOffersEpic(tradingPair));

  //Fetch LogTake events for set historicalRange
  dispatch(
    tradesReducer.actions.fetchLogTakeEventsEpic({
      fromBlock: currentLatestBlock - period.avgBlockPerDefaultPeriod(),
      toBlock: currentLatestBlock,
    }),
  )
  .then(
    () => {
      dispatch(tradesReducer.actions.initialMarketHistoryLoaded());
      dispatch(tradesReducer.actions.subscribeLogTakeEventsEpic(currentLatestBlock));
    },
  );

  dispatch(
    balancesReducer.actions.subscribeTokenTransfersEventsEpic(
      window.contracts.tokens,
      accounts.defaultAccount(getState())
    ),
  );

  dispatch(CheckNetworkAction.fulfilled());
};

const checkNetworkInitialEpic = () => async (dispatch, getState) => {

  dispatch(CheckNetworkAction.pending());

  dispatch(platformReducer.actions.networkChanged());
  dispatch(platformReducer.actions.web3Reset());
  const currentNetworkName = network.activeNetworkName(getState());
  dispatch(offersReducer.actions.initOffersEpic());

  // Loading contracts and initializing market
  try {
    return await Promise.all([
      dispatch(platformReducer.actions.contractsLoaded(contractsBootstrap.init(currentNetworkName))),
      await dispatch(balancesReducer.actions.getDefaultAccountEthBalance()),
      await dispatch(balancesReducer.actions.subscribeAccountEthBalanceChangeEventEpic(web3.eth.defaultAccount)),
      await dispatch(platformReducer.actions.marketInitialized(marketBootstrap.init(dispatch, currentNetworkName))),
      dispatch(balancesReducer.actions.getAllTradedTokensBalances(window.contracts.tokens)),
    ]).then(onNetworkCheckCompleted(dispatch, getState));
  } catch (e) {
    console.error(e);
  }
};

const checkNetworkEpic = () => async (dispatch, getState) => {
  dispatch(CheckNetworkAction.pending());

  const previousNetworkId = network.activeNetworkId(getState());

  const currentNetworkIdAction = await dispatch(getConnectedNetworkId());
  const currentNetworkName = network.activeNetworkName(getState());

  if (previousNetworkId !== currentNetworkIdAction.value) {
    /**
     * When network has changed we:
     * - call web3.reset()
     * - reload contracts with new network adressess.
     * - initialize market on the new network.
     * - load token allowances.
     *
     */
    return await Promise.all([
      dispatch(platformReducer.actions.web3Reset()),
      dispatch(platformReducer.actions.contractsLoaded(contractsBootstrap.init(currentNetworkName))),
      await dispatch(balancesReducer.actions.getDefaultAccountEthBalance()),
      await dispatch(platformReducer.actions.marketInitialized(marketBootstrap.init(dispatch, currentNetworkName))),
      dispatch(balancesReducer.actions.getAllTradedTokensBalances(window.contracts.tokens)),
    ]).then(onNetworkCheckCompleted(dispatch, getState));
  }
};

const fetchEthereumPrice = createAction(
  'NETWORK/FETCH_ETHEREUM_PRICE',
  () => fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/').then(res => res.json()),
);

const connected = createAction(
  'NETWORK/CONNECTED',
);

const connecting = createAction(
  'NETWORK/CONNECTING',
);

const disconnected = createAction(
  'NETWORK/DISCONNECTED',
);

const getConnectedNetworkId = createAction(
  'NETWORK/GET_CONNECTED_NETWORK_ID',
  () => web3p.version.getNetwork(),
);

const actions = {
  connected,
  connecting,
  disconnected,
  checkNetworkInitialEpic,
  checkNetworkEpic,
  getBlock,
  getLatestBlock,
  getLatestBlockNumber,
  getConnectedNetworkId,
  fetchEthereumPrice,
};

const reducer = handleActions({
  [connected]: state => state.set('status', ONLINE).set('isConnecting', false),
  [connecting]: state => state.set('isConnecting', true),
  [disconnected]: state => state.set('status', CLOSED).set('isConnecting', false),
  [syncNetwork.pending]: (state) => state.setIn(['sync', 'isPending'], true),
  [syncNetwork.fulfilled]: (state) => state.setIn(['sync', 'isPending'], false),
  [fulfilled(getConnectedNetworkId)]: (state, { payload }) =>
    state.update('activeNetworkId', (nid) => !!payload && nid === payload ? nid : payload),
  [fulfilled(getLatestBlockNumber)]: (state, { payload }) =>
    state.update('latestBlockNumber', () => payload),
  [fulfilled(fetchEthereumPrice)]: (state, { payload }) => state.set('latestEthereumPrice', payload[0]),
}, initialState);

export default {
  actions,
  reducer,
};