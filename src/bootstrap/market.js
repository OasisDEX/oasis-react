import marketsReducer from './../store/reducers/markets';
import limitsReducer from './../store/reducers/limits';
import platformReducer from '../store/reducers/platform';
import tradesReducer from '../store/reducers/trades';
const configs = require('../configs');



const init = async (dispatch, activeNetwork) =>
  await Promise.all([
    dispatch(marketsReducer.actions.setActiveMarketAddress(window.contracts.market.address)),
    dispatch(marketsReducer.actions.setActiveMarketOriginBlockNumber(configs.market[activeNetwork].blockNumber)),
    dispatch(marketsReducer.actions.checkIfMarketIsOpen()),
    dispatch(marketsReducer.actions.checkMarketCloseTime()),
    dispatch(marketsReducer.actions.checkIfOrderMatchingIsEnabled()),
    dispatch(marketsReducer.actions.checkIfBuyEnabled()),
    dispatch(limitsReducer.actions.GetAllTradedTokenMinSellLimits(window.contracts.market, window.contracts.tokens)),
    dispatch(tradesReducer.actions.initializeVolumes()),
    dispatch(tradesReducer.actions.initMarketHistory()),
    dispatch(tradesReducer.actions.initTradesHistory())
  ]).then(
    () => { dispatch(platformReducer.actions.marketInitialized()); },
  );

export default {
  init,
};