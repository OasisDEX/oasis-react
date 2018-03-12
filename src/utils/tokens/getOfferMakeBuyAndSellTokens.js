import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../../store/reducers/offerMakes';

const getOfferMakeBuyAndSellTokens = (tradingPair, offerMakeType) => {
  switch (offerMakeType) {
    case MAKE_BUY_OFFER:
      return {
        buyToken: tradingPair['baseToken'],
        sellToken: tradingPair['quoteToken']
      };
    case MAKE_SELL_OFFER:
      return {
        buyToken: tradingPair['quoteToken'],
        sellToken: tradingPair['baseToken']
    };
  }
};

export default getOfferMakeBuyAndSellTokens;