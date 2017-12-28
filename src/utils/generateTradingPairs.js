import { TOKEN_MAKER } from '../constants';

export const generateTradingPairs = (baseTokens, quoteTokens) => {
  const TradingPairs = [
    {
      base: 'MKR',
      quote: 'W-ETH',
      priority: 10,
      isDefault: true
    },
    {
      base: 'W-ETH',
      quote: 'SAI',
      priority: 9,
      isDefault: true
    },
    {
      base: 'MKR',
      quote: 'SAI',
      priority: 8,
      isDefault: true
    },
  ];

  baseTokens.forEach((base) => {
    if(base === TOKEN_MAKER) { return; }
    quoteTokens.forEach((quote) => {
      TradingPairs.push({
        base,
        quote,
        priority: 0,
        isDefault: false
      });
    });
  });
  return TradingPairs;
};