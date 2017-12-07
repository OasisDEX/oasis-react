import { TOKEN_MAKER } from '../constant';

export const generateTradingPairs = (baseTokens, quoteTokens) => {
  const TradingPairs = [
    {
      base: 'MKR',
      quote: 'W-ETH',
      priority: 10,
    },
    {
      base: 'W-ETH',
      quote: 'SAI',
      priority: 9,
    },
    {
      base: 'MKR',
      quote: 'SAI',
      priority: 8,
    },
  ];

  baseTokens.forEach((base) => {
    if(base === TOKEN_MAKER) { return; }
    quoteTokens.forEach((quote) => {
      TradingPairs.push({
        base,
        quote,
        priority: 0,
      });
    });
  });
  return TradingPairs;
};