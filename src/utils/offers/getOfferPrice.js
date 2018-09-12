import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from "../../constants";
import web3 from "../../bootstrap/web3";

export const getOfferPrice = (
  offer,
  offerMakeType
) => {
  switch (offerMakeType) {
    case MAKE_BUY_OFFER:
      return web3.toBigNumber(offer.bid_price);
    case MAKE_SELL_OFFER:
      return web3.toBigNumber(offer.ask_price);
  }
};
