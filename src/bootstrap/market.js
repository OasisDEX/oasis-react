import marketsReducer from './../store/reducers/markets';
import limitsReducer from './../store/reducers/limits';

const init = async (dispatch) => {
  return await Promise.all([
    dispatch(marketsReducer.actions.checkIfMarketIsOpen()),
    dispatch(marketsReducer.actions.checkMarketCloseTime()),
    dispatch(marketsReducer.actions.checkIfOrderMatchingIsEnabled()),
    dispatch(marketsReducer.actions.checkIfBuyEnabled()),
    dispatch(limitsReducer.actions.GetAllTradedTokenMinSellLimits(window.contracts.market, window.contracts.tokens)),
  ]);
};

export default {
  init,
};