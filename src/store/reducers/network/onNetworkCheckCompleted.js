import network from "../../selectors/network";
import tradesReducer from "../trades";
import { subscribeLatestBlockFilterEpic } from "./subscribeLatestBlockFilterEpic";
import balancesReducer from "../balances";
import { getTokenContractsList } from "../../../bootstrap/contracts";
import { CheckNetworkAction } from "./CheckNetworkAction";
import period from "../../../utils/period";
import tokens from "../../selectors/tokens";
import tokensReducer from "../tokens";
import accounts from "../../selectors/accounts";
import offersReducer from "../offers";
import { createAction } from 'redux-actions';


export const setLastNetworkCheckStartAt = createAction(
  "NETWORK/SET_LAST_NETWORK_CHECK_START_AT",
  () => Date.now().toString()
);


export const setLastNetworkCheckEndAt = createAction(
  "NETWORK/SET_LAST_NETWORK_CHECK_END_AT",
  () => Date.now().toString()
);



export const onNetworkCheckCompleted = (dispatch, getState) => async () => {
  const currentLatestBlock = network.latestBlockNumber(getState());
  dispatch(tokensReducer.actions.getActiveTradingPairAllowanceStatus());
  dispatch(subscribeLatestBlockFilterEpic());

  // Inital offersReducer sync
  dispatch(offersReducer.actions.subscribeOffersEventsEpic());

  const tradingPair =
    tokens.activeTradingPair(getState()) ||
    tokens.defaultTradingPair(getState()).toJSON();
  // console.log({tradingPair});
  dispatch(offersReducer.actions.syncOffersEpic(tradingPair));

  //Fetch LogTake events for set historicalRange
  dispatch(
    tradesReducer.actions.fetchLogTakeEventsEpic({
      fromBlock: currentLatestBlock - period.avgBlockPerDefaultPeriod(),
      toBlock: currentLatestBlock
    })
  ).then(() => {
    dispatch(tradesReducer.actions.initialMarketHistoryLoaded());
    dispatch(
      tradesReducer.actions.subscribeLogTakeEventsEpic(currentLatestBlock)
    );
  });


  dispatch(
    balancesReducer.actions.subscribeTokenTransfersEventsEpic(
      getTokenContractsList(),
      accounts.defaultAccount(getState())
    )
  );

  dispatch(CheckNetworkAction.fulfilled());
};
