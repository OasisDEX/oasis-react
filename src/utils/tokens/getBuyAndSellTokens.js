import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../../store/reducers/offerTakes';

const getBuyAndSellTokens = (tradingPair, offerTakeType) => {
  switch (offerTakeType) {
    case TAKE_BUY_OFFER: return {
      buyToken: tradingPair['quoteToken'],
      sellToken: tradingPair['baseToken']
    };
    case TAKE_SELL_OFFER: return {
      buyToken: tradingPair['baseToken'],
      sellToken: tradingPair['quoteToken']
    };
  }
};

export  default getBuyAndSellTokens;