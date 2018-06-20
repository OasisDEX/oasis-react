import { ETH_UNIT_ETHER } from "../../constants";
import { ASK, BID } from "../../store/reducers/trades";
import { formatAmount, formatPrice } from "../tokens/pair";

export const myOffersDisplayFormat = offer => {
  let baseAmount = null,
    baseAmountFullPrecision = null,
    quoteAmount = null,
    quoteAmountFullPrecision = null;
  switch (offer.tradeType) {
    case BID:
      baseAmount = formatAmount(offer.buyHowMuch, true, ETH_UNIT_ETHER);
      baseAmountFullPrecision = offer.buyHowMuch;
      quoteAmount = formatAmount(offer.sellHowMuch, true, ETH_UNIT_ETHER);
      quoteAmountFullPrecision = offer.sellHowMuch;
      break;
    case ASK:
      baseAmount = formatAmount(offer.sellHowMuch, true, ETH_UNIT_ETHER);
      baseAmountFullPrecision = offer.sellHowMuch;
      quoteAmount = formatAmount(offer.buyHowMuch, true, ETH_UNIT_ETHER);
      quoteAmountFullPrecision = offer.buyHowMuch;
      break;
  }

  return {
    offerType: offer.offerType,
    tradeTypeEl: offer.tradeTypeEl,
    price: formatPrice(offer.price),
    priceFullPrecision: offer.price,
    baseAmount,
    baseAmountFullPrecision,
    quoteAmount,
    quoteAmountFullPrecision,
    owner: offer.owner,
    id: offer.id
  };
};
