import { TOKEN_DAI, TOKEN_MAKER } from '../constants';

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
      quote: 'DAI',
      priority: 9,
      isDefault: true
    },
    {
      base: 'MKR',
      quote: 'DAI',
      priority: 8,
      isDefault: true
    },
    {
      base: 'SAI',
      quote: 'DAI',
      priority: 6,
      isDefault: true
    },
  ];

  baseTokens.forEach((base) => {
    if(base === TOKEN_MAKER || base === TOKEN_DAI) { return; }
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