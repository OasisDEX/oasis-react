/* eslint-disable no-unused-vars */
import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import { find } from "lodash";

import web3, { web3p } from "../../bootstrap/web3";

import { createPromiseActions } from "../../utils/createPromiseActions";
import { fulfilled } from "../../utils/store";
import contractsBootstrap from "../../bootstrap/contracts";
import platformReducer from "./platform";
import balancesReducer from "./balances";

import marketBootstrap from "../../bootstrap/market";

import {
  CLOSED,
  CONNECTING,
  LIVE_NET_ID,
  ONLINE,
  OUT_OF_SYNC
} from "../../constants";
import tradesReducer from "./trades";
import period from "../../utils/period";
import network from "../selectors/network";
import offersReducer from "./offers";
import tokens from "../selectors/tokens";
import transactionsReducer from "./transactions";
import { HEALTHCHECK_INTERVAL_MS } from "../../index";
import accounts from "../selectors/accounts";

import tokensReducer from "./tokens";

const initialState = fromJS({
  status: CLOSED,
  sync: { isPending: false, ts: null },
  activeNetworkName: null,
  activeNetworkId: null,
  latestBlockNumber: null,
  outOfSync: true,
  tokenAddresses: null,
  latestEthereumPrice: null
});

const syncNetwork = createPromiseActions("NETWORK/SYNC_NETWORK");

const CheckNetworkAction = createPromiseActions("NETWORK/CHECK_NETWORK");

/**
 * @dev We get latest mined block number
 */
const getLatestBlockNumber = createAction(
  "NETWORK_GET_LATEST_BLOCK_NUMBER",
  async () => web3p.eth.getBlockNumber()
);

const getBlock = createAction("NETWORK_GET_LATEST_BLOCK", async blockNumber =>
  web3p.eth.getBlock(blockNumber)
);

const getLatestBlock = () => getBlock("latest");

/**
 * @dev Here we create 3 actions for checking the network status
 * @type {{pending, fulfilled, rejected}|*}
 */
const subscribeLatestBlockFilter = createPromiseActions(
  "NETWORK/SUBSCRIBE_LATEST_BLOCK_FILTER"
);

const subscribeLatestBlockFilterEpic = () => async (dispatch, getState) => {
  dispatch(subscribeLatestBlockFilter.pending());

  const update = () => {
    dispatch(getLatestBlockNumber());
    dispatch(fetchEthereumPrice());
    dispatch(transactionsReducer.actions.getCurrentTxNonceEpic());
    dispatch(transactionsReducer.actions.getCurrentGasPrice());
    dispatch(
      balancesReducer.actions.syncTokenBalances(
        window.contracts.tokens,
        accounts.defaultAccount(getState())
      )
    );
    dispatch(offersReducer.actions.getBestOfferIdsForActiveTradingPairEpic());
    dispatch(tokensReducer.actions.getActiveTradingPairAllowanceStatus());
  };

  const tid = setInterval(() => {
    update();
  }, HEALTHCHECK_INTERVAL_MS);

  web3.eth.filter("latest", (e, b) => {
    clearInterval(tid);
    update();
  });

  dispatch(subscribeLatestBlockFilter.fulfilled());
  return subscribeLatestBlockFilter;
};

const onNetworkCheckCompleted = (dispatch, getState) => async () => {
  const currentLatestBlock = network.latestBlockNumber(getState());
  dispatch(tokensReducer.actions.getActiveTradingPairAllowanceStatus());
  dispatch(subscribeLatestBlockFilterEpic());

  // Inital offersReducer sync
  dispatch(offersReducer.actions.subscribeOffersEventsEpic());

  const tradingPair =
    tokens.activeTradingPair(getState()) ||
    tokens.defaultTradingPair(getState()).toJSON()
  // console.log({tradingPair});
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
    )
  );

  dispatch(CheckNetworkAction.fulfilled());
};

const checkNetworkInitialEpic = () => async (dispatch, getState) => {
  dispatch(CheckNetworkAction.pending());

  dispatch(platformReducer.actions.networkChanged());
  dispatch(platformReducer.actions.web3Reset());
  const currentNetworkName = network.activeNetworkName(getState());
  dispatch(offersReducer.actions.initOffersEpic());
  if(!tokens.activeTradingPair(getState())) {
    dispatch(
      tokensReducer.actions.setActiveTradingPairEpic(
        tokens.defaultTradingPair(getState()),
        false
      )
    )
  }

  // Loading contracts and initializing market
  try {
    return await Promise.all([
      dispatch(
        platformReducer.actions.contractsLoaded(
          contractsBootstrap.init(currentNetworkName)
        )
      ),
      await dispatch(balancesReducer.actions.getDefaultAccountEthBalance()),
      await dispatch(
        balancesReducer.actions.subscribeAccountEthBalanceChangeEventEpic(
          accounts.defaultAccount(getState())
        )
      ),
      await dispatch(
        platformReducer.actions.marketInitialized(
          marketBootstrap.init(dispatch, currentNetworkName)
        )
      ),
      dispatch(
        balancesReducer.actions.getAllTradedTokensBalances(
          window.contracts.tokens,
          accounts.defaultAccount(getState())
        )
      )
    ]).then(onNetworkCheckCompleted(dispatch, getState));
  } catch (e) {
    console.warn("Can't fetch network data!", e);
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
      dispatch(
        platformReducer.actions.contractsLoaded(
          contractsBootstrap.init(currentNetworkName)
        )
      ),
      await dispatch(balancesReducer.actions.getDefaultAccountEthBalance()),
      await dispatch(
        platformReducer.actions.marketInitialized(
          marketBootstrap.init(dispatch, currentNetworkName)
        )
      ),
      dispatch(
        balancesReducer.actions.getAllTradedTokensBalances(
          window.contracts.tokens,
          accounts.defaultAccount(getState())
        )
      )
    ]).then(onNetworkCheckCompleted(dispatch, getState));
  }
};

const fetchEthereumPrice = createAction("NETWORK/FETCH_ETHEREUM_PRICE", () =>
  fetch("https://api.coinmarketcap.com/v1/ticker/ethereum/").then(res =>
    res.json()
  )
);

const connected = createAction("NETWORK/CONNECTED");

const connecting = createAction("NETWORK/CONNECTING");

const disconnected = createAction("NETWORK/DISCONNECTED");

const getConnectedNetworkId = createAction(
  "NETWORK/GET_CONNECTED_NETWORK_ID",
  () => web3p.version.getNetwork()
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
  fetchEthereumPrice
};

const reducer = handleActions(
  {
    [connected]: state =>
      state.set("status", ONLINE).set("isConnecting", false),
    [connecting]: state =>
      state.set("isConnecting", true).set("status", CONNECTING),
    [disconnected]: state =>
      state.set("status", CLOSED).set("isConnecting", false),
    [syncNetwork.pending]: state =>
      state.setIn(["sync", "isPending"], true).set("status", OUT_OF_SYNC),
    [syncNetwork.fulfilled]: state =>
      state.setIn(["sync", "isPending"], ONLINE),
    [fulfilled(getConnectedNetworkId)]: (state, { payload }) =>
      state.update(
        "activeNetworkId",
        nid => (!!payload && nid === payload ? nid : payload)
      ),
    [fulfilled(getLatestBlockNumber)]: (state, { payload }) =>
      state.update("latestBlockNumber", () => payload),
    [fulfilled(fetchEthereumPrice)]: (state, { payload }) =>
      state.set("latestEthereumPrice", payload[0])
  },
  initialState
);

export default {
  actions,
  reducer
};
