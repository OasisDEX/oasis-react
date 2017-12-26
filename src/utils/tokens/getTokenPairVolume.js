import BigNumber from 'bignumber.js';

export default (tokenPairTrades, baseToken) => {
  /**
   *
   * Reduce token pair history entries to single volume number.
   *
   * Perquisites:
   * - one of the market history entry tokens is always base token
   * - unit is wei
   */
  const tokenPairTradesToVolume = (volume, currentTokenPairTrade) => {
    if (currentTokenPairTrade.buyWhichToken === baseToken) {
      return volume.add(currentTokenPairTrade.buyHowMuch);
    } else if (currentTokenPairTrade.sellWhichToken === baseToken) {
      return volume.add(currentTokenPairTrade.sellHowMuch);
    }
  };
  return tokenPairTrades.reduce(tokenPairTradesToVolume, new BigNumber(0))
};