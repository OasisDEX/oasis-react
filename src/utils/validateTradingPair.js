export const validateTradingPair = (
  baseToken, quoteToken, tradingPairsList
) => !(!baseToken || !quoteToken || !tradingPairsList.find(tp => tp.base === baseToken && tp.quote === quoteToken));