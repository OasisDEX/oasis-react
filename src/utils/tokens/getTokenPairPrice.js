import BigNumber from 'bignumber.js';

export default (tradeHistoryEntry, baseToken, quoteToken) => {
  if(!tradeHistoryEntry) {
    return null;
  }
  let price = 0;
  if (tradeHistoryEntry.buyWhichToken === quoteToken && tradeHistoryEntry.sellWhichToken === baseToken) {
    price = new BigNumber(tradeHistoryEntry.buyHowMuch).div(new BigNumber(tradeHistoryEntry.sellHowMuch));
  } else if (tradeHistoryEntry.buyWhichToken === baseToken && tradeHistoryEntry.sellWhichToken === quoteToken) {
    price = new BigNumber(tradeHistoryEntry.sellHowMuch).div(new BigNumber(tradeHistoryEntry.buyHowMuch));
  }
  return price;
};