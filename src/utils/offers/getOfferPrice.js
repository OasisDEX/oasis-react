import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from "../../constants";
import web3 from "../../bootstrap/web3";

export const getOfferPrice = (
  offer,
  offerMakeType,
  formats = { asString: true, asSortValue: true, asBigNumber: false }
) => {
  switch (offerMakeType) {
    case MAKE_BUY_OFFER:
      return {
        asString: offer.bid_price,
        asSortValue: offer.bid_price_sort,
        asBN: formats.asBigNumber ? web3.toBigNumber(offer.bid_price): null
      };
    case MAKE_SELL_OFFER:
      return {
        asString: offer.ask_price,
        asSortValue: offer.ask_price_sort,
        asBN: formats.asBigNumber ? web3.toBigNumber(offer.bid_price) : null
      };
  }
};
