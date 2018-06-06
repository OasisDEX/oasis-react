import network from "../../selectors/network";
import tradesReducer from "../trades";
import { subscribeLatestBlockFilterEpic } from "./subscribeLatestBlockFilterEpic";
import { CheckNetworkAction } from "./CheckNetworkAction";
import period from "../../../utils/period";
import tokens from "../../selectors/tokens";
import tokensReducer from "../tokens";
import offersReducer from "../offers";
import { createAction } from "redux-actions";
import { getTokenContractsList } from '../../../bootstrap/contracts';
import balancesReducer from '../balances';
import accounts from '../../selectors/accounts';
import { clearAccountSpecificSubscriptions } from '../../../bootstrap/web3';
import platformReducer from '../platform';

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
    dispatch(subscribeLatestBlockFilterEpic());
    // Initial offersReducer sync
    dispatch(offersReducer.actions.subscribeOffersEventsEpic());
      dispatch(
        tradesReducer.actions.fetchLogTakeEventsEpic({
          fromBlock: currentLatestBlock - period.avgBlockPerDefaultPeriod(),
          toBlock: currentLatestBlock
        })
      ).then(() => {

        const tradingPair =
          tokens.activeTradingPair(getState()) ||
          tokens.defaultTradingPair(getState()).toJSON();
        dispatch(offersReducer.actions.syncOffersEpic(tradingPair)).then(
          () => dispatch(platformReducer.actions.setIsAppLoadingDisabled())
        );
        dispatch(tradesReducer.actions.initialMarketHistoryLoaded());
        dispatch(
          tradesReducer.actions.subscribeLogTakeEventsEpic(currentLatestBlock)
        );

      });
    //Fetch LogTake events for set historicalRange
  }
  if(setInitialSubscriptions || accountChanged) {
    const defaultAccount = accounts.defaultAccount(getState());
    if (!setInitialSubscriptions) {
      clearAccountSpecificSubscriptions();
      dispatch(balancesReducer.actions.getDefaultAccountEthBalance());
      dispatch(balancesReducer.actions.subscribeAccountEthBalanceChangeEventEpic(
        accounts.defaultAccount(getState())
      ));
    }

    dispatch(
      balancesReducer.actions.getAllTradedTokensBalances(
        getTokenContractsList(),
        defaultAccount
      )
    ).then(
      () => {
        dispatch(platformReducer.actions.setGlobalFormLockDisabled());
      }
    );
    dispatch(
      balancesReducer.actions.subscribeTokenTransfersEventsEpic(
        getTokenContractsList(),
        defaultAccount
      )
    );
    dispatch(tokensReducer.actions.getActiveTradingPairAllowanceStatus());
  }
  // console.log(setLastNetworkCheckEndAt(), Date());
  // console.log('onNetworkCheckEnd: end')
  // console.log({tradingPair});
  dispatch(CheckNetworkAction.fulfilled());
  dispatch(setLastNetworkCheckEndAt());
};
