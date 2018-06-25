import { createAction, handleActions } from "redux-actions";
import { fromJS, List, Set } from "immutable";

import { createPromiseActions } from "../../utils/createPromiseActions";
import * as BigNumber from "bignumber.js";
import tokens from "../selectors/tokens";
import logTakeToTrade from "../../utils/trades/logTakeToTrade";
import first from "lodash/first";
import { fulfilled } from "../../utils/store";
import {
  getSubscriptionsByTypeAndTag,
  registerAccountSpecificSubscriptions,
  web3p
} from "../../bootstrap/web3";
import { getMarketContractInstance } from "../../bootstrap/contracts";
import accounts from "../selectors/accounts";
import web3 from "../../bootstrap/web3";
import markets from "../selectors/markets";
import network from "../selectors/network";
import {
  SUBSCRIPTIONS_USER_LOG_TAKE_EVENTS,
  USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER,
  USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE
} from "../../constants";
import { solSha3 } from "../../utils/solSha3";
import userTrades from "../selectors/userTrades";

const initialState = fromJS({
  volumes: null,
  marketHistory: null,
  initialMarketHistoryLoaded: false,
  loadingUserMarketHistory: null,
  volumesLoaded: false,
  tradeHistoryStartingBlockTimestamp: null,
  latestEventsBlocks: {
    LogTake: null,
    LogMake: null,
    LogTrade: null
  }
});

const INIT = "USER_TRADES/INIT";
const INIT_VOLUMES = "USER_TRADES/INIT_VOLUMES";
const INIT_MARKET_HISTORY = "USER_TRADES/INIT_MARKET_HISTORY";
const INIT_TRADES_HISTORY = "USER_TRADES/INIT_TRADES_HISTORY";
const UPDATE_TOKEN_PAIR_VOLUME = "USER_TRADES/UPDATE_TOKEN_PAIR_VOLUME";

const SUBSCRIBE_LOG_TAKE_EVENTS = "USER_TRADES/SUBSCRIBE_LOG_TAKE_EVENTS";

const FETCH_LOG_TAKE_EVENTS = "USER_TRADES/FETCH_LOG_TAKE_EVENTS";

export const BID = "USER_TRADES/TRADE_TYPE_BID";
export const ASK = "USER_TRADES/TRADE_TYPE_ASK";

const GET_TRADE_HISTORY_BLOCK_STARTING_BLOCK_TIMESTAMP =
  "USER_TRADES/GET_TRADE_HISTORY_BLOCK_STARTING_BLOCK_TIMESTAMP";

const Init = createAction(INIT, () => null);

const initMarketHistoryAction = createAction(INIT_MARKET_HISTORY, imh =>
  fromJS(imh)
);
const initMarketHistory = () => dispatch => {
  const initialMarketHistoryData = Set([]);
  dispatch(initMarketHistoryAction(initialMarketHistoryData));
};

const initTradesHistoryAction = createAction(INIT_TRADES_HISTORY, ith =>
  fromJS(ith)
);
const initTradesHistory = () => dispatch => {
  const initialTradesData = [];
  dispatch(initTradesHistoryAction(initialTradesData));
};

const initVolumesAction = createAction(INIT_VOLUMES, iv => fromJS(iv));
const initializeVolumes = () => (dispatch, getState) => {
  const initialVolumesData = {};
  tokens.tradingPairs(getState()).forEach(
    tp =>
      (initialVolumesData[`${tp.get("base")}/${tp.get("quote")}`] = {
        volume: 0,
        latestPrice: null
      })
  );
  dispatch(initVolumesAction(initialVolumesData));
};

const logTradeEvent = createAction(
  "USER_TRADES/EVENT___LOG_TRADE",
  logTrade => {
    return logTrade;
  }
);

const logTakeEvent = createAction("USER_TRADES/EVENT___LOG_TAKE", logTake => {
  return logTake;
});

const logMakeEvent = createAction("USER_TRADES/EVENT___LOG_MAKE", logMake => {
  return logMake;
});

const getTradeHistoryStartingBlockTimestamp = createAction(
  GET_TRADE_HISTORY_BLOCK_STARTING_BLOCK_TIMESTAMP,
  async blockNumber => (await web3p.eth.getBlock(blockNumber)).timestamp
);

const loadInitialTradeHistory = createAction(
  "USER_TRADES/LOAD_INITIAL_TRADE_HISTORY",
  takeEventsList => takeEventsList.map(logTakeToTrade)
);

const addTradeHistoryEntry = createAction(
  "USER_TRADES/ADD_HISTORY_ENTRY",
  takeEvent => logTakeToTrade(takeEvent)
);

const initialMarketHistoryLoaded = createAction(
  "USER_TRADES/INITIAL_MARKET_HISTORY_LOADED"
);

const updateTradingPairVolume = createAction(
  UPDATE_TOKEN_PAIR_VOLUME,
  ({ tradingPair, takeAmount }) => ({ tradingPair, takeAmount })
);

const loadingUserMarketHistory = createAction(
  "USER_TRADES/LOADING_USER_MARKET_HISTORY",
  isLoading => isLoading
);

const fetchLogTakeEventsAction = createPromiseActions(FETCH_LOG_TAKE_EVENTS);
const fetchLogTakeEventsEpic = ({ fromBlock, toBlock, perTradingPair }) => (
  dispatch,
  getState
) => {
  dispatch(fetchLogTakeEventsAction.pending());
  const { baseToken, quoteToken } = tokens.activeTradingPair(getState());
  dispatch(loadingUserMarketHistory(true));
  return Promise.all([
    new Promise((resolve, reject) => {
      getMarketContractInstance()
        .LogTake(
          {
            taker: accounts.defaultAccount(getState()),
            pair: perTradingPair
              ? solSha3(
                  network.getTokenAddress(getState(), quoteToken),
                  network.getTokenAddress(getState(), baseToken)
                )
              : undefined
          },
          { fromBlock, toBlock }
        )
        .get((err, logTakesList) => {
          if (err) {
            dispatch(fetchLogTakeEventsAction.rejected(err));
            reject(err);
          }
          resolve({
            toBlock,
            logTakesList: logTakesList.map(item => ({
              ...item,
              userToTradeBaseRelation: USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER,
              userToTradeAdditionalRelation:
                item.args.taker.toString() === accounts.defaultAccount(getState())
                  ? USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE
                  : null
            }))
          });
        });
    }),
    new Promise((resolve, reject) => {
      getMarketContractInstance()
        .LogTake(
          {
            maker: accounts.defaultAccount(getState()),
            pair: perTradingPair
              ? solSha3(
                  network.getTokenAddress(getState(), baseToken),
                  network.getTokenAddress(getState(), quoteToken)
                )
              : undefined
          },
          { fromBlock, toBlock }
        )
        .get((err, logTakesList) => {
          if (err) {
            dispatch(fetchLogTakeEventsAction.rejected(err));
            reject(err);
          }
          const firstLogTake = first(logTakesList);
          if (firstLogTake) {
            dispatch(
              getTradeHistoryStartingBlockTimestamp(
                first(logTakesList).blockNumber
              )
            );
          }
          resolve({
            toBlock,
            logTakesList: logTakesList.map(item => ({
              ...item,
              userToTradeBaseRelation: USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE,
              userToTradeAdditionalRelation:
                item.args.maker.toString() === accounts.defaultAccount(getState())
                  ? USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER
                  : null
            }))
          });
        });
    })
  ]).then(
    ([{ logTakesList: userMadeOffers }, { logTakesList: userTakenOffers }]) => {
      dispatch(loadInitialTradeHistory(userMadeOffers.concat(userTakenOffers)));
      dispatch(loadingUserMarketHistory(false));
      dispatch(initialMarketHistoryLoaded());
      dispatch(
        subscribeLogTakeEventsEpic({
          fromBlock: network.latestBlockNumber(getState()),
          perTradingPair
        })
      );
    }
  );
};

const subscribeLogTakeEventsAction = createPromiseActions(
  SUBSCRIBE_LOG_TAKE_EVENTS
);
const subscribeLogTakeEventsEpic = ({ fromBlock, perTradingPair }) => (
  dispatch,
  getState
) => {
  const { baseToken, quoteToken } = tokens.activeTradingPair(getState());
  dispatch(subscribeLogTakeEventsAction.pending());
  registerAccountSpecificSubscriptions({
    userMarketHistoryEventSubs: {
      key: fromJS({ baseToken, quoteToken, tag: "takes" }),
      value: getMarketContractInstance()
        .LogTake(
          {
            taker: accounts.defaultAccount(getState()),
            pair: perTradingPair
              ? solSha3(
                  network.getTokenAddress(getState(), quoteToken),
                  network.getTokenAddress(getState(), baseToken)
                )
              : undefined
          },
          { fromBlock: fromBlock, toBlock: "latest" }
        )
        .then((err, logTake) => {
          dispatch(
            addTradeHistoryEntry({
              ...logTake,
              userToTradeBaseRelation: USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER,
              userToTradeAdditionalRelation:
                logTake.args.maker.toString() === accounts.defaultAccount(getState())
                  ? USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE
                  : null
            })
          );
        })
    }
  });
  registerAccountSpecificSubscriptions({
    userMarketHistoryEventSubs: {
      key: fromJS({ baseToken, quoteToken, tag: "makes" }),
      value: getMarketContractInstance()
        .LogTake(
          {
            maker: accounts.defaultAccount(getState()),
            pair: perTradingPair
              ? web3.sha3(
                  network.getTokenAddress(getState(), baseToken),
                  network.getTokenAddress(getState(), quoteToken)
                )
              : undefined
          },
          { fromBlock: fromBlock, toBlock: "latest" }
        )
        .then((err, logTake) => {
          dispatch(
            addTradeHistoryEntry({
              ...logTake,
              userToTradeBaseRelation: USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE,
              userToTradeAdditionalRelation:
                logTake.args.taker.toString() === accounts.defaultAccount(getState())
                  ? USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER
                  : null
            })
          );
        })
    }
  });
  dispatch(subscribeLogTakeEventsAction.fulfilled());
};

const fetchAndSubscribeUserTradesHistoryEpic = perActiveTradingPair => (
  dispatch,
  getState
) => {
  if (
    userTrades.loadindUserMarketHistory(getState()) &&
    userTrades.initialMarketHistoryLoaded(getState())
  ) {
    return;
  }
  dispatch(loadingUserMarketHistory(true));
  if (perActiveTradingPair) {
    const { baseToken, quoteToken } = tokens.activeTradingPair(getState());
    if (
      getSubscriptionsByTypeAndTag(
        SUBSCRIPTIONS_USER_LOG_TAKE_EVENTS,
        fromJS({ baseToken, quoteToken, tag: "makes" })
      ) &&
      getSubscriptionsByTypeAndTag(
        SUBSCRIPTIONS_USER_LOG_TAKE_EVENTS,
        fromJS({ baseToken, quoteToken, tag: "takes" })
      )
    ) {
      return;
    }
  } else {
    if (
      getSubscriptionsByTypeAndTag(
        SUBSCRIPTIONS_USER_LOG_TAKE_EVENTS,
        fromJS({ tag: "makes" })
      ) &&
      getSubscriptionsByTypeAndTag(
        SUBSCRIPTIONS_USER_LOG_TAKE_EVENTS,
        fromJS({ tag: "takes" })
      )
    ) {
      return;
    }
  }

  console.log(
    "loading user trades history",
    network.latestBlockNumber(getState()),
    markets.activeMarketOriginBlock(getState()).get("number")
  );
  dispatch(
    fetchLogTakeEventsEpic({
      fromBlock: markets.activeMarketOriginBlock(getState()).get("number"),
      toBlock: network.latestBlockNumber(getState()),
      perTradingPair: perActiveTradingPair
    })
  );
};

const actions = {
  Init,
  initializeVolumes,
  initMarketHistory,
  initTradesHistory,
  subscribeLogTakeEventsEpic,
  fetchLogTakeEventsEpic,
  initialMarketHistoryLoaded,
  logTradeEvent,
  logTakeEvent,
  logMakeEvent,
  fetchAndSubscribeUserTradesHistoryEpic
};

const reducer = handleActions(
  {
    [loadingUserMarketHistory]: (state, { payload }) =>
      state.set("loadingUserMarketHistory", payload),
    [initVolumesAction]: (state, { payload }) => state.set("volumes", payload),
    [initTradesHistoryAction]: (state, { payload }) =>
      state.set("USER_TRADES", payload),
    [updateTradingPairVolume]: (
      state,
      { payload: { tradingPair, takeAmount, latestPrice } }
    ) =>
      state
        .updateIn(["volumes", tradingPair, "volume"], currentVolume =>
          new BigNumber(currentVolume).add(new BigNumber(takeAmount))
        )
        .setIn(["volumes", tradingPair, "latestPrice"], latestPrice),
    [logTakeEvent]: (state, { payload }) =>
      state.setIn(["latestEventsBlocks", "LogTake"], payload.blockNumber),
    [loadInitialTradeHistory]: (state, { payload }) =>
      state.updateIn(["marketHistory"], () => List(payload)),
    [addTradeHistoryEntry]: (state, { payload }) =>
      state.updateIn(["marketHistory"], marketHistory =>
        marketHistory.push(payload)
      ),
    [initialMarketHistoryLoaded]: state =>
      state.set("initialMarketHistoryLoaded", true),
    [fulfilled(getTradeHistoryStartingBlockTimestamp)]: (state, { payload }) =>
      state.set("tradeHistoryStartingBlockTimestamp", payload)
  },
  initialState
);

export default {
  actions,
  reducer
};
