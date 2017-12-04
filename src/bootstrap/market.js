import marketsReducer from './../store/reducers/markets';
import limitsReducer from './../store/reducers/limits';


const init = async (d) => {
  return await Promise.all([
    d(marketsReducer.actions.checkIfMarketIsOpen()),
    d(marketsReducer.actions.checkMarketCloseTime()),
    d(marketsReducer.actions.checkIfOrderMatchingIsEnabled()),
    d(marketsReducer.actions.checkIfBuyEnabled()),
    d(limitsReducer.actions.GetAllTradedTokenMinSellLimits(window.contracts.market, window.contracts.tokens))
  ]).then(console.log);
};

export default {
  init,
};