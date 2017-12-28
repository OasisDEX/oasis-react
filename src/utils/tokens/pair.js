import BigNumber from 'bignumber.js';
import { ETH_UNIT_ETHER } from '../../constants';
import web3 from '../../bootstrap/web3';

export const PRICE_DECIMAL = 4;
export const VOLUME_DECIMAL = 2;

const format = (baseToken, quoteToken) => `${baseToken}/${quoteToken}`;
const trades = (marketData, baseToken, quoteToken) =>
  marketData.filter(marketHistoryEntry => {
      const { sellWhichToken, buyWhichToken } = marketHistoryEntry;
      const tradingPairTokensList = [baseToken, quoteToken];
      if (
        tradingPairTokensList.some(t => t === sellWhichToken) && tradingPairTokensList.some(t => t === buyWhichToken)
      ) {
        return marketHistoryEntry;
      }
    },
  );

const volume = (tradingPairTrades, baseToken) => {
  /**
   *
   * Reduce token pair history entries to single volume number.
   *
   * Perquisites:
   * - one of the market history entry tokens is always base token
   * - unit is wei
   */
  const tradingPairTradesToVolume = (volume, currentTradingPairTrade) => {
    if (currentTradingPairTrade.buyWhichToken === baseToken) {
      return volume.add(currentTradingPairTrade.buyHowMuch);
    } else if (currentTradingPairTrade.sellWhichToken === baseToken) {
      return volume.add(currentTradingPairTrade.sellHowMuch);
    }
  };
  return tradingPairTrades.reduce(tradingPairTradesToVolume, new BigNumber(0))
};

const price = (tradeHistoryEntry, baseToken, quoteToken) => {
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

const formatPrice =
  (price) =>
    price ? price.toFormat(PRICE_DECIMAL) : null;


const formatVolume =
  (tradingPairVolume) => web3.fromWei(tradingPairVolume, ETH_UNIT_ETHER).toFormat(VOLUME_DECIMAL);

export {
  format,
  trades,
  volume,
  price,
  formatPrice,
  formatVolume
}