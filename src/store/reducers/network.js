import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import { find } from 'lodash';

import web3, { web3p } from '../../bootstrap/web3';

import sessionReducer from './session';

import { createPromiseActions } from '../../utils/createPromiseActions';
import { fulfilled } from '../../utils/store';
import contractsBootstrap from '../../bootstrap/contracts';
import platformReducer from './platform';
import balancesReducer from './balances';

import marketBootstrap from '../../bootstrap/market';

import { CLOSED, KOVAN_NET_ID, LIVE_NET_ID, ONLINE } from '../../constants';
import tradesReducer from './trades';
import period from '../../utils/period';
import network from '../selectors/network';
import offersReducer from './offers';
import tokens from '../selectors/tokens';
import findOffer from '../../utils/offers/findOffer';

const initialState = Immutable.fromJS(
  {
    status: CLOSED,
    sync: { isPending: false, ts: null },
    activeNetworkName: null,
    activeNetworkId: null,
    latestBlockNumber: null,
    outOfSync: true,
    tokenAddresses: null,
    networks: [
      {
        id: 100,
        name: 'private',
        startingBlock: null,
        avgBlocksPerDay: null,
      },
      {
        id: 1,
        name: 'mainnet',
        startingBlock: null,
        avgBlocksPerDay: 5760,
      },
      {
        id: 42,
        name: 'kovan',
        startingBlock: null,
        avgBlocksPerDay: 21600,
      },
      {
        id: 3,
        name: 'Ropsten',
        startingBlock: null,
        avgBlocksPerDay: null,
      },
    ],
  });

const CHECK_IF_USER_HAS_BALANCE_IN_OLD_WRAPPER = 'NETWORK/CHECK_IF_USER_HAS_BALANCE_IN_OLD_WRAPPER';
const INIT_NETWORK = 'NETWORK/INIT_NETWORK';
const CHECK_NETWORK = 'NETWORK/CHECK_NETWORK';
const CONNECTED = 'NETWORK/CONNECTED';
const CONNECTING = 'NETWORK/CONNECTING';
const DISCONNECTED = 'NETWORK/DISCONNECTED';
const SYNC_NETWORK = 'NETWORK/SYNC_NETWORK';
const GET_CONNECTED_NETWORK_ID = 'NETWORK/GET_CONNECTED_NETWORK_ID';

const SET_TOKEN_ADDRESSES = 'NETWORK/SET_TOKEN_ADDRESSES';

const setTokenAddresses = createAction(
  SET_TOKEN_ADDRESSES, (activeNetwork) => require('../../configs').tokens[activeNetwork],
);

// Check which accounts are available and if defaultAccount is still available,
// Otherwise set it to localStorage, Session, or first element in accounts

const CheckIfUserHasBalanceInOldWrapper = createAction(
  CHECK_IF_USER_HAS_BALANCE_IN_OLD_WRAPPER,
  function checkIfUserHasBalanceInOldWrapper(userAddress) {
    // Named the old wrapper - OW-ETH
    // Dapple.getToken('OW-ETH', (error, token) => {
    //   if (!error) {
    //     if (token) {
    //       token.balanceOf(userAddress, (err, balance) => {
    //         if (!error) {
    //           if (balance.toString(10) > 0) {
    //             $('#wrapperUpdate').modal({
    //                                         keyboard: false,
    //                                         show: true,
    //                                         backdrop: false,
    //                                       });
    //             $('#wrapperUpdate').on('shown.bs.modal', () => {
    //               $('.amount').
    //                   text(Blaze._globalHelpers.formatBalance(balance, 3, '',
    //                                                           false,
    //                   ));
    //               Session.set('oldWrapperBalance', balance.toString(10));
    //             });
    //           }
    //         } else {
    //           console.debug(`Couldn't get balance for ${userAddress}.`, error);
    //         }
    //       });
    //     }
    //   } else {
    //     console.debug(`Cannot extract information for ${token} `, error);
    //   }
    // });
  },
);

// Initialize everything on new network
const InitNetwork = createAction(
  INIT_NETWORK,
  function initNetwork(newNetwork) {
    // Dapple.init(newNetwork);
    // checkAccounts().then(checkIfUserHasBalanceInOldWrapper);
    // const isMatchingEnabled = checkIfOrderMatchingEnabled(market.type);
    // const isBuyEnabled = checkIfBuyEnabled(market.type);
    // Promise.all([isMatchingEnabled, isBuyEnabled]).then(() => {
    //   Session.set('network', newNetwork);
    //   Session.set('isConnected', true);
    //   Session.set('latestBlock', 0);
    //   Session.set('startBlock', 0);
    //   doHashChange();
    //   denotePrecision();
    //   Tokens.sync();
    //   Limits.sync();
    //   Offers.sync();
    // });
  },
);

/**
 *
 *
 */

const syncNetwork = createPromiseActions(
  SYNC_NETWORK,
);

/**
 * TODO @Arek Revise this logic
 */
const syncNetworkEpic = () => async (dispatch, getStore) => {
  const isNetworkSyncPending = getStore().getIn(['network', 'sync', 'isPending']);
  dispatch(checkNetworkEpic());
  web3.eth.isSyncing((error, sync) => {
    if (!error) {
      dispatch(sessionReducer.actions.SetValue('syncing', sync !== false));
      // Stop all app activity
      if (sync === true) {
        web3.reset(true);
        dispatch(checkNetworkEpic());
        // show sync info
      } else if (sync) {
        dispatch(sessionReducer.actions.SetValue('startingBlock', sync.startingBlock));
        dispatch(sessionReducer.actions.SetValue('currentBlock', sync.currentBlock));
        dispatch(sessionReducer.actions.SetValue('highestBlock', sync.highestBlock));
      } else {
        dispatch(sessionReducer.actions.SetValue('highestBlock', sync.highestBlock));
        dispatch(sessionReducer.actions.SetValue('outOfSync', false));
        // offersReducer.actions.Sync();
        // web3.eth.filter('latest', () => {
        //   tokensReducer.actions.Sync();
        //   limitsReducer.actions.Sync();
        //   transactionsReducer.actions.Sync();
        // });
      }
    }
  });
};

/**
 *
 *
 */

const CheckNetworkAction = createPromiseActions(CHECK_NETWORK);


/**
 * @dev We get latest mined block number
 */
const getLatestBlockNumber = createAction(
  'NETWORK_GET_LATEST_BLOCK_NUMBER',
  async () => web3p.eth.getBlockNumber(),
);

const getLatestBlock = createAction(
  'NETWORK_GET_LATEST_BLOCK',
  async () => web3p.eth.getBlock('latest'),
);


/**
 * @dev Here we create 3 actions for checking the network status
 * @type {{pending, fulfilled, rejected}|*}
 */
const subscribeLatestBlockFilter = createPromiseActions(
  'NETWORK/SUBSCRIBE_LATEST_BLOCK_FILTER',
);
const subscribeLatestBlockFilterEpic = () => async (dispatch, getState, subscribe) => {
  dispatch(subscribeLatestBlockFilter.pending());
  web3.eth.filter('latest', (e, b) => {
    dispatch(getLatestBlockNumber());
    dispatch(subscribeLatestBlockFilter.rejected(e));
  });

  dispatch(subscribeLatestBlockFilter.fulfilled());
  return subscribeLatestBlockFilter;
};

const checkNetworkEpic = (providerType, isInitialHealthcheck) => async (dispatch, getState) => {
  dispatch(CheckNetworkAction.pending());
  const onNetworkCheckCompleted = async () =>
  {
    const currentLatestBlock = network.latestBlockNumber(getState());
    dispatch(subscribeLatestBlockFilterEpic());

    /**
     * Inital offersReducer sync
     */

    dispatch(offersReducer.actions.subscribeOffersEventsEpic());
    dispatch(offersReducer.actions.syncOffersEpic(
      tokens.activeTradingPair(getState())
    ));

    /**
     *  Fetch LogTake events for set historicalRange
     */
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
      balancesReducer.actions.subscribeTokenTransfersEventsEpic(window.contracts.tokens),
    );
    dispatch(CheckNetworkAction.fulfilled());
  };

  const previousNetworkId = getState().getIn(['network', 'activeNetworkId']);
  const previousProviderType = getState().getIn(['network', 'providerType']);
  let currentNetworkName = null;
  /**
   * We save provider type in store if not already set.
   */
  if (previousProviderType !== providerType) {
    dispatch(platformReducer.actions.setProviderType(providerType));
  }

  if (isInitialHealthcheck) {
    /**
     * On first run we dispatch network *networkChanged* action and call web.reset().
     */
    dispatch(platformReducer.actions.networkChanged());
    dispatch(platformReducer.actions.web3Reset());
    currentNetworkName = getState().getIn(['network', 'activeNetworkName']);
    dispatch(setTokenAddresses(currentNetworkName));
    dispatch(offersReducer.actions.initOffersEpic());

    /**
     * Loading contracts and initializing market
     */
    try {
      return await Promise.all([
        dispatch(platformReducer.actions.contractsLoaded(contractsBootstrap.init(currentNetworkName))),
        await dispatch(balancesReducer.actions.getDefaultAccountEthBalance()),
        await dispatch(balancesReducer.actions.subscribeAccountEthBalanceChangeEventEpic(web3.eth.defaultAccount)),
        await dispatch(platformReducer.actions.marketInitialized(marketBootstrap.init(dispatch, currentNetworkName))),
        dispatch(balancesReducer.actions.getAllTradedTokensBalances(window.contracts.tokens)),
        dispatch(balancesReducer.actions.getAllTradedTokensAllowances(window.contracts.tokens, window.contracts.market.address)),
      ]).then(onNetworkCheckCompleted);
    }
    catch (e) {
      console.error(e);
    }

  } else {
    const currentNetworkIdAction = await dispatch(getConnectedNetworkId());
    currentNetworkName = getState().getIn(['network', 'activeNetworkName']);

    if (previousNetworkId !== currentNetworkIdAction.value) {

      /**
       * When network changed we need to change token addresses;
       */
      dispatch(setTokenAddresses(currentNetworkName));
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
        dispatch(balancesReducer.actions.getAllTradedTokensAllowances(window.contracts.tokens, window.contracts.market.address)),
      ]).then(onNetworkCheckCompleted);
    }
  }

};

const connected = createAction(
  CONNECTED,
);

const connecting = createAction(
  CONNECTING,
);

const disconnected = createAction(
  DISCONNECTED,
);

const getConnectedNetworkId = createAction(
  GET_CONNECTED_NETWORK_ID,
  () => web3p.version.getNetwork(),
);

const actions = {
  connected,
  connecting,
  disconnected,
  checkNetworkEpic,
  getLatestBlock,
  getLatestBlockNumber,
  getConnectedNetworkId,
};

const reducer = handleActions({
  [connected]: state => state.set('status', ONLINE).set('isConnecting', false),
  [connecting]: state => state.set('isConnecting', true),
  [disconnected]: state => state.set('status', CLOSED).set('isConnecting', false),
  [syncNetwork.pending]: (state) =>
    state
      .setIn(['sync', 'isPending'], true),
  [syncNetwork.fulfilled]: (state) => state.setIn(['sync', 'isPending'], false),
  [fulfilled(getConnectedNetworkId)]: (state, { payload }) =>
    state
      .update('activeNetworkId', (nid) => !!payload && nid === payload ? nid : payload)
      .update('activeNetworkName',
        (activeNetworkName) => {
          if (payload) {
            return state
              .get('networks').find(n => n.get('id') === parseInt(payload))
              .get('name');
          }
          return activeNetworkName;
        },
      ),
  [setTokenAddresses]: (state, { payload }) => state.set('tokenAddresses', payload),
  [fulfilled(getLatestBlockNumber)]: (state, { payload }) =>
    state.update('latestBlockNumber', () => payload),

}, initialState);

export default {
  actions,
  reducer,
};
