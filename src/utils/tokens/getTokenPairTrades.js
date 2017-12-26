export default (marketData, baseToken, quoteToken) =>
  marketData.filter(marketHistoryEntry => {
      const { sellWhichToken, buyWhichToken } = marketHistoryEntry;
      const tradingPairTokensList = [baseToken, quoteToken];
      if (
        tradingPairTokensList.some(t => t === sellWhichToken) && tradingPairTokensList.some(t => t === buyWhichToken)
      ) {
        return marketHistoryEntry;
      }
    },
  );