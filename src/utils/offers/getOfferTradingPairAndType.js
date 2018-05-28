/* eslint-disable no-debugger */
import { getOfferType } from '../orders';
import tokens from '../../store/selectors/tokens';
import getTokenByAddress from '../tokens/getTokenByAddress';

const getOfferTradingPairAndType = (
  { sellWhichTokenAddress, buyWhichTokenAddress },
  state
) => {
  const tradingPairs = tokens.tradingPairs(state);
  const offerBuyToken = getTokenByAddress(buyWhichTokenAddress);
  const offerSellToken = getTokenByAddress(sellWhichTokenAddress);

  const offerTradingPair = tradingPairs.find(tp => {
    const base = tp.get("base");
    const quote = tp.get("quote");
    return (base === offerBuyToken && offerSellToken === quote) ||
      (base === offerSellToken && offerBuyToken === quote);
  });
  return {
    baseToken: offerTradingPair.get("base"),
    quoteToken: offerTradingPair.get("quote"),
    offerType: getOfferType(offerTradingPair.get("base"), {
      sellWhichTokenAddress,
      buyWhichTokenAddress
    })
  };
};

export default getOfferTradingPairAndType;
