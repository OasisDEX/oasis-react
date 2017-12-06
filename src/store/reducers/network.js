import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';
import { find } from 'lodash';

import web3 from '../../bootstrap/web3';

import sessionReducer from './session';
import tokensReducer from './tokens';
import limitsReducer from './limits';

import { createPromiseActions } from '../../utils/createPromiseActions';
import { Session } from '../../utils/session';
import { fulfilled, rejected } from '../../utils/store';
import contractsBootstrap from '../../bootstrap/contracts';
import platformReducer from './platform';
import balancesReducer from './balances';

import marketBootstrap from '../../bootstrap/market';

import { KOVAN_NET_ID, LIVE_NET_ID } from '../../constants';


const initialState = Immutable.fromJS(
  {
    sync: { isPending: false, ts: null },
    activeNetworkName: null,
    activeNetworkId: null,
    latestBlockNumber: null,
    outOfSync: true,
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
const SYNC_NETWORK = 'NETWORK/SYNC_NETWORK';
const GET_CONNECTED_NETWORK_ID = 'NETWORK/GET_CONNECTED_NETWORK_ID';

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
        window.web3.reset(true);
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

const CheckNetwork = createPromiseActions(CHECK_NETWORK);

/**
 * @dev Here we create 3 actions for checking the network status
 * @type {{pending, fulfilled, rejected}|*}
 */
const subscribeLatestBlockFilter = createPromiseActions(
  'NETWORK/SUBSCRIBE_LATEST_BLOCK_FILTER',
);

/**
 * @dev We get latest mined block number
 */
const getLatestBlockNumber = createAction(
  'NETWORK_GET_LATEST_BLOCK_NUMBER',
  async () => new Promise((resolve, reject) =>
    web3.eth.getBlockNumber((e, latestBlockNumber) => {
      if (e) {
        reject(e);
      }
      else {
        resolve(latestBlockNumber);
      }
    }),
  ),
);

const getLatestBlock = createAction(
  'NETWORK_GET_LATEST_BLOCK',
  async () => new Promise((resolve, reject) =>
    web3.eth.getBlock('latest', (e, res) => {
      if (e) {
        reject(e);
      }
      else {
        resolve(res);
      }
    }),
  ),
);

const subscribeLatestBlockFilterEpic = () => (dispatch) => {
  dispatch(subscribeLatestBlockFilter.pending());
  window.web3p.eth.filter('latest').then(
    latestBlockHash => dispatch(getLatestBlockNumber(latestBlockHash)),
    rej => dispatch(subscribeLatestBlockFilter.rejected(rej))
  );
  dispatch(subscribeLatestBlockFilter.fulfilled());
};

const checkNetworkEpic = (providerType, isInitialHealthcheck) => async (dispatch, getState) => {
  dispatch(CheckNetwork.pending());

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

    /**
     * Loading contracts and initializing market
     */
    await Promise.all([
      dispatch(platformReducer.actions.contractsLoaded(contractsBootstrap.init(currentNetworkName))),
      await dispatch(balancesReducer.actions.getDefaultAccountEthBalance()),
      await dispatch(balancesReducer.actions.subscribeAccountEthBalanceChangeEventEpic(window.web3.eth.defaultAccount)),
      await dispatch(platformReducer.actions.marketInitialized(marketBootstrap.init(dispatch))),
      dispatch(balancesReducer.actions.getAllTradedTokensBalances(window.contracts.tokens)),
      dispatch(balancesReducer.actions.getAllTradedTokensAllowances(window.contracts.tokens, window.contracts.market.address)),
      dispatch(balancesReducer.actions.subscribeTokenTransfersEventsEpic(window.contracts.tokens))
    ]);

  } else {

    const currentNetworkIdAction = await dispatch(getConnectedNetworkId());
    currentNetworkName = getState().getIn(['network', 'activeNetworkName']);

    if (previousNetworkId !== currentNetworkIdAction.value) {
      /**
       * When network has changed we:
       * - call web3.reset()
       * - reload contracts with new network adressess.
       * - initialize market on the new network.
       * - load token allowances.
       *
       */
      await Promise.all([
        dispatch(platformReducer.actions.web3Reset()),
        dispatch(platformReducer.actions.contractsLoaded(contractsBootstrap.init(currentNetworkName))),
        await dispatch(balancesReducer.actions.getDefaultAccountEthBalance()),
        await dispatch(platformReducer.actions.marketInitialized(marketBootstrap.init(dispatch))),
        dispatch(balancesReducer.actions.getAllTradedTokensBalances(window.contracts.tokens)),
        dispatch(balancesReducer.actions.getAllTradedTokensAllowances(window.contracts.tokens, window.contracts.market.address)),
        dispatch(balancesReducer.actions.subscribeTokenTransfersEventsEpic(window.contracts.tokens))
      ]);
    }
  }
  dispatch(CheckNetwork.fulfilled);
};

const getConnectedNetworkId = createAction(
  GET_CONNECTED_NETWORK_ID,
  () => window.web3p.version.getNetwork(),
);

const actions = {
  checkNetworkEpic,
  getLatestBlock,
  getConnectedNetworkId,
  subscribeLatestBlockFilterEpic,
};


const reducer = handleActions({
  [syncNetwork.pending]: (state) =>
    state
      .setIn(['sync', 'isPending'], true),
  [syncNetwork.fulfilled]: (state) => state.setIn(['sync', 'isPending'], true),
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
  [fulfilled(getLatestBlockNumber)]: (state, { payload }) =>
    state.update('latestBlockNumber', () => payload),

}, initialState);

export default {
  actions,
  reducer,
};
