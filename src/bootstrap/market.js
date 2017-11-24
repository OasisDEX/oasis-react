import marketsReducer from './../store/reducers/markets';

const init = async (d) => {
  return await Promise.all([
    d(marketsReducer.actions.checkIfMarketIsOpen()),
    d(marketsReducer.actions.checkMarketCloseTime()),
    d(marketsReducer.actions.checkIfOrderMatchingIsEnabled()),
    d(marketsReducer.actions.checkIfBuyEnabled()),
  ]).then(console.log);
};

export default {
  init,
};