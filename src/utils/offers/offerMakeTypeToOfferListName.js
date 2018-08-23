import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../../constants'

export const offerMakeTypeToOfferListName = (offerMakeType) => {
  switch (offerMakeType) {
    case MAKE_BUY_OFFER: return 'buyOffers';
    case MAKE_SELL_OFFER: return 'sellOffers'
  }
};