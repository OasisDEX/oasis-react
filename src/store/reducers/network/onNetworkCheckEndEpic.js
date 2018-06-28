import network from "../../selectors/network";
import tradesReducer from "../trades";
import { CheckNetworkAction } from "./CheckNetworkAction";
import period from "../../../utils/period";
import tokens from "../../selectors/tokens";
import tokensReducer from "../tokens";
import offersReducer from "../offers";
import { createAction } from "redux-actions";
import { getTokenContractsList } from "../../../bootstrap/contracts";
import balancesReducer from "../balances";
import accounts from "../../selectors/accounts";
import { clearAccountSpecificSubscriptions } from "../../../bootstrap/web3";
import platformReducer from "../platform";
import {
  SUBSCRIPTIONS_ETHER_BALANCE_CHANGE_EVENTS,
  SUBSCRIPTIONS_GROUP_ACCOUNT_SPECIFIC_INITIAL,
  SUBSCRIPTIONS_GROUP_GLOBAL_INITIAL,
  SUBSCRIPTIONS_LOG_TAKE_EVENTS,
  SUBSCRIPTIONS_ORDERS_EVENTS,
  SUBSCRIPTIONS_TOKEN_TRANSFER_EVENTS
} from "../../../constants";
import { registerSubscription } from "../../../utils/subscriptions/registerSubscription";
import userTradesReducer from "../userTrades";

export const setLastNetworkCheckStartAt = createAction(
  "NETWORK/SET_LAST_NETWORK_CHECK_START_AT",
  () => Date.now().toString()
);

export const setLastNetworkCheckEndAt = createAction(
  "NETWORK/SET_LAST_NETWORK_CHECK_END_AT",
  () => Date.now().toString()
);

export const onNetworkCheckEndEpic = (
  dispatch,
  getState,
  setInitialSubscriptions,
  accountChanged
) => {
  // console.log('onNetworkCheckEnd: start')
  /**
   * This should be done only once ( Unless network is changed )!!!
   */
  if (setInitialSubscriptions) {
    const currentLatestBlock = network.latestBlockNumber(getState());
    dispatch(
      balancesReducer.actions.getAllTradedTokensBalances(
        getTokenContractsList(),
        accounts.defaultAccount(getState())
      )
    );
    // Initial offersReducer sync

    const tradingPair =
      tokens.activeTradingPair(getState()) ||
      tokens.defaultTradingPair(getState()).toJSON();

    dispatch(
      tradesReducer.actions.fetchLogTakeEventsEpic({
        fromBlock: currentLatestBlock - period.avgBlockPerDefaultPeriod(),
        toBlock: currentLatestBlock
      })
    ).then(() => {
      dispatch(tradesReducer.actions.initialMarketHistoryLoaded());
      registerSubscription(
        SUBSCRIPTIONS_LOG_TAKE_EVENTS,
        () => {
          dispatch(
            tradesReducer.actions.subscribeLogTakeEventsEpic(currentLatestBlock)
          );
        },
        { dispatch, getState },
        SUBSCRIPTIONS_GROUP_GLOBAL_INITIAL
      );
    });
    //Fetch LogTake events for set historicalRange
    dispatch(offersReducer.actions.syncOffersEpic(tradingPair)).then(() => {
        dispatch(platformReducer.actions.setIsAppLoadingDisabled());
    });
    registerSubscription(
      SUBSCRIPTIONS_ORDERS_EVENTS,
      () => {
        dispatch(offersReducer.actions.subscribeOffersEventsEpic());
      },
      { dispatch, getState },
      SUBSCRIPTIONS_GROUP_GLOBAL_INITIAL
    );

  }

  if (setInitialSubscriptions || accountChanged) {
    const defaultAccount = accounts.defaultAccount(getState());

    /**
     * We do that for each change of the default account, but not on initial load.
     */
    if (!setInitialSubscriptions) {
      dispatch(userTradesReducer.actions.initTradesHistory());
      dispatch(userTradesReducer.actions.initMarketHistory());
      dispatch(userTradesReducer.actions.initializeVolumes());
      clearAccountSpecificSubscriptions({ dispatch, getState });
      dispatch(balancesReducer.actions.getDefaultAccountEthBalance());
      registerSubscription(
        SUBSCRIPTIONS_ETHER_BALANCE_CHANGE_EVENTS,
        () => {
          dispatch(
            balancesReducer.actions.subscribeAccountEthBalanceChangeEventEpic(
              accounts.defaultAccount(getState())
            )
          );
        },
        { dispatch, getState },
        SUBSCRIPTIONS_GROUP_ACCOUNT_SPECIFIC_INITIAL
      );
      dispatch(
        userTradesReducer.actions.fetchAndSubscribeUserTradesHistoryEpic()
      );
    }

    dispatch(
      balancesReducer.actions.getAllTradedTokensBalances(
        getTokenContractsList(),
        defaultAccount
      )
    ).then(() => {
      dispatch(offersReducer.actions.getBestOfferIdsForActiveTradingPairEpic());
      dispatch(platformReducer.actions.setGlobalFormLockDisabled());
    });

    registerSubscription(
      SUBSCRIPTIONS_TOKEN_TRANSFER_EVENTS,
      () => {
        dispatch(
          balancesReducer.actions.subscribeTokenTransfersEventsEpic(
            getTokenContractsList(),
            defaultAccount
          )
        );
      },
      { dispatch, getState },
      SUBSCRIPTIONS_GROUP_ACCOUNT_SPECIFIC_INITIAL
    );
    dispatch(tokensReducer.actions.getActiveTradingPairAllowanceStatus());
  }

  if (setInitialSubscriptions) {
    dispatch(
      platformReducer.actions.setAllInitialSubscriptionsRegisteredEnabled()
    );
  }
  // console.log(setLastNetworkCheckEndAt(), Date());
  // console.log('onNetworkCheckEnd: end')
  // console.log({tradingPair});
  dispatch(CheckNetworkAction.fulfilled());
  dispatch(setLastNetworkCheckEndAt());
};
