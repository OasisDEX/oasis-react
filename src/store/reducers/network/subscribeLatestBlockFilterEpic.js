import balancesReducer from "../balances";
import { areContractsInitialized, getTokenContractsList } from '../../../bootstrap/contracts';
import { HEALTHCHECK_INTERVAL_MS } from "../../../index";
import { createPromiseActions } from "../../../utils/createPromiseActions";
import transactionsReducer from "../transactions";
import web3, { web3p } from "../../../bootstrap/web3";
import accounts from "../../selectors/accounts";
import offersReducer from "../offers";
import { createAction } from "redux-actions";
import { getTimestamp } from "../../../utils/time";
import { checkIfOutOfSyncEpic } from './checkIfOutOfSync';
import offers from '../../selectors/offers';
import { getTradingPairOfferCount } from '../offers/getTradingPairOffersCount';
import tokens from '../../selectors/tokens';

export const fetchEthereumPrice = createAction(
  "NETWORK/FETCH_ETHEREUM_PRICE",
  () =>
    fetch("https://api.coinmarketcap.com/v1/ticker/ethereum/").then(res =>
      res.json()
    )
);

/**
 * @dev We get latest mined block number
 */
export const getLatestBlockNumber = createAction(
  "NETWORK/GET_LATEST_BLOCK_NUMBER",
  async () =>
    web3p.eth.getBlockNumber().then(latestBlockNumber => ({
      latestBlockNumber,
      latestBlockReceivedAt: getTimestamp()
    }))
);

/**
 * @dev We get latest mined block number
 */
export const setLatestBlockNumber = createAction(
  "NETWORK/SET_LATEST_BLOCK_NUMBER",
  latestBlockNumber => ({
    latestBlockNumber,
    latestBlockReceivedAt: getTimestamp()
  })
);

export const getBlock = createAction(
  "NETWORK_GET_BLOCK",
  async blockNumberLatestOrPending =>
    web3p.eth.getBlock(blockNumberLatestOrPending)
);

export const getLatestBlock = createAction(
  "NETWORK_GET_LATEST_BLOCK",
  async () => web3p.eth.getBlock("latest")
);

/**
 * @dev Here we create 3 actions for checking the network status
 * @type {{pending, fulfilled, rejected}|*}
 */
const subscribeLatestBlockFilter = createPromiseActions(
  "NETWORK/SUBSCRIBE_LATEST_BLOCK_FILTER"
);
export const subscribeLatestBlockFilterEpic = () => async (
  dispatch,
  getState
) => {
  dispatch(subscribeLatestBlockFilter.pending());

  const update = () => {
    dispatch(checkIfOutOfSyncEpic());
    dispatch(fetchEthereumPrice());
    dispatch(transactionsReducer.actions.getCurrentTxNonceEpic());
    dispatch(transactionsReducer.actions.getCurrentGasPrice());
    if (areContractsInitialized && tokens.activeTradingPair(getState())) {
      if (offers.activeTradingPairOffersInitiallyLoaded(getState())) {
        dispatch(offersReducer.actions.getBestOfferIdsForActiveTradingPairEpic());
        dispatch(
          balancesReducer.actions.syncTokenBalances(
            getTokenContractsList(),
            accounts.defaultAccount(getState())
          )
        );
        dispatch(
          getTradingPairOfferCount(
            tokens.activeTradingPairBaseToken(getState()),
            tokens.activeTradingPairQuoteToken(getState())
          )
        )
      }
    }
  };

  const tid = setInterval(() => {
    update();
  }, HEALTHCHECK_INTERVAL_MS);

  web3.eth.filter("latest", () => {
    clearInterval(tid);
    update();
  });

  dispatch(subscribeLatestBlockFilter.fulfilled());
  return subscribeLatestBlockFilter;
};
