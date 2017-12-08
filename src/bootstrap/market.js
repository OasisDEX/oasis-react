import marketsReducer from './../store/reducers/markets';
import limitsReducer from './../store/reducers/limits';
import platformReducer from '../store/reducers/platform';

const init = async (dispatch) =>
  await Promise.all([
    dispatch(marketsReducer.actions.setActiveMarketAddress(window.contracts.market.address)),
    dispatch(marketsReducer.actions.checkIfMarketIsOpen()),
    dispatch(marketsReducer.actions.checkMarketCloseTime()),
    dispatch(marketsReducer.actions.checkIfOrderMatchingIsEnabled()),
    dispatch(marketsReducer.actions.checkIfBuyEnabled()),
    dispatch(limitsReducer.actions.GetAllTradedTokenMinSellLimits(window.contracts.market, window.contracts.tokens)),
  ]).then(
    p => { dispatch(platformReducer.actions.marketInitialized()); },
  );

export default {
  init,
};