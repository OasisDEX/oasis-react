import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../../store/reducers/offerMakes';
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../../store/reducers/offerTakes';

const tokenToBeAllowedForOffer = ({offerType, sellToken, buyToken }) => {
  // console.log({buyToken, sellToken, offerType})
  switch (offerType) {
    case MAKE_SELL_OFFER:
    case MAKE_BUY_OFFER:
      return buyToken;
    case TAKE_BUY_OFFER:
    case TAKE_SELL_OFFER:
      throw new Error('not implemented');
  }
};

export default tokenToBeAllowedForOffer;