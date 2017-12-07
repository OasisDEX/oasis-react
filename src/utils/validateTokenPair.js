export const validateTokenPair = (
  baseToken, quoteToken, tokenPairsList
) => !(!baseToken || !quoteToken || !tokenPairsList.find(tp => tp.base === baseToken && tp.quote === quoteToken));