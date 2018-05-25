/* eslint-disable no-debugger */
import { getOfferType } from "../orders";
import tokens from "../../store/selectors/tokens";
import getTokenByAddress from "../tokens/getTokenByAddress";

const getOfferTradingPairAndType = (
  { sellWhichTokenAddress, buyWhichTokenAddress, id, syncType },
  state,
  log
) => {
  const tradingPairs = tokens.tradingPairs(state);
  const offerBuyToken = getTokenByAddress(buyWhichTokenAddress);
  const offerSellToken = getTokenByAddress(sellWhichTokenAddress);

  const offerTradingPair = tradingPairs.find(tp => {
    const base = tp.get("base");
    const quote = tp.get("quote");
    const found =
      (base === offerBuyToken && offerSellToken === quote) ||
      (base === offerSellToken && offerBuyToken === quote);
    return found;
  });

  if (!offerTradingPair) {
    // eslint-disable-next-line no-debugger
    //debugger;
  }
  if (!sellWhichTokenAddress) {
    console.log(sellWhichTokenAddress, buyWhichTokenAddress);
  }

  if (log || !offerTradingPair) {
    console.info("Trading pair not found:", {
      id,
      syncType,
      offerType: getOfferType(offerTradingPair.get("base"), {
        sellWhichTokenAddress,
        buyWhichTokenAddress,
        offerBuyToken: getTokenByAddress(buyWhichTokenAddress),
        offerSellToken: getTokenByAddress(sellWhichTokenAddress)
      })
    });
    if (window.letMeDebugThis) {
      debugger
    }
  }

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
