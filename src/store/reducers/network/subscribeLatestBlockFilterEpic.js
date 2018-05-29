import balancesReducer from "../balances";
import { getTokenContractsList } from "../../../bootstrap/contracts";
import { HEALTHCHECK_INTERVAL_MS } from "../../../index";
import { createPromiseActions } from "../../../utils/createPromiseActions";
import transactionsReducer from "../transactions";
import web3, { web3p } from "../../../bootstrap/web3";
import accounts from "../../selectors/accounts";
import tokensReducer from "../tokens";
import offersReducer from "../offers";
import { createAction } from "redux-actions";

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
  "NETWORK_GET_LATEST_BLOCK_NUMBER",
  async () => web3p.eth.getBlockNumber()
);

export const getBlock = createAction(
  "NETWORK_GET_LATEST_BLOCK",
  async blockNumber => web3p.eth.getBlock(blockNumber)
);

export const getLatestBlock = () => getBlock("latest");

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
    dispatch(getLatestBlockNumber());
    dispatch(fetchEthereumPrice());
    dispatch(transactionsReducer.actions.getCurrentTxNonceEpic());
    dispatch(transactionsReducer.actions.getCurrentGasPrice());
    dispatch(
      balancesReducer.actions.syncTokenBalances(
        getTokenContractsList(),
        accounts.defaultAccount(getState())
      )
    );
    dispatch(offersReducer.actions.getBestOfferIdsForActiveTradingPairEpic());
    dispatch(tokensReducer.actions.getActiveTradingPairAllowanceStatus());
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
