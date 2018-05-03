import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../../constants';
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../../store/reducers/offerTakes';

const tokenToBeAllowedForOffer = ({offerType, sellToken, buyToken }) => {
  // console.log({buyToken, sellToken, offerType})
  switch (offerType) {
    case MAKE_SELL_OFFER:
    case MAKE_BUY_OFFER:
      return buyToken;
    case TAKE_BUY_OFFER:
    case TAKE_SELL_OFFER:
      return sellToken;
  }
};

export default tokenToBeAllowedForOffer;