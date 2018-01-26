import { getOfferType } from '../orders';
import tokens from '../../store/selectors/tokens';
import getTokenByAddress from '../tokens/getTokenByAddress';

const getOfferTradingPairAndType = ({ sellWhichTokenAddress, buyWhichTokenAddress, id, syncType }, state ,log) => {
  const tradingPairs = tokens.tradingPairs(state);
  const offerBuyToken = getTokenByAddress(buyWhichTokenAddress);
  const offerSellToken = getTokenByAddress(sellWhichTokenAddress);

  const offerTradingPair = tradingPairs.find(tp => {
    const base =tp .get('base');
    const quote = tp.get('quote');
    return (base === offerBuyToken && offerSellToken === quote) || (base ===offerSellToken && offerBuyToken === quote);
  });

  if(!offerTradingPair) {
    debugger;
  }

  if(log) {
    console.log({
      id,
      syncType,
      baseToken: offerTradingPair.get('base'),
      quoteToken: offerTradingPair.get('quote'),
      offerType: getOfferType(offerTradingPair.get('base'), { sellWhichTokenAddress, buyWhichTokenAddress })
    });
  }

  return {
    baseToken: offerTradingPair.get('base'),
    quoteToken: offerTradingPair.get('quote'),
    offerType: getOfferType(offerTradingPair.get('base'), { sellWhichTokenAddress, buyWhichTokenAddress })
  }
};


export default getOfferTradingPairAndType;