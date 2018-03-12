import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../../store/reducers/offerMakes';
import { MAKE_SELL_OFFER_FORM_NAME } from '../../containers/OasisMakeSellOffer';
import { MAKE_BUY_OFFER_FORM_NAME } from '../../containers/OasisMakeBuyOffer';

const offerMakeToFormName = (offerMakeType) => {
  switch (offerMakeType) {
    case MAKE_SELL_OFFER: return MAKE_SELL_OFFER_FORM_NAME;
    case MAKE_BUY_OFFER: return MAKE_BUY_OFFER_FORM_NAME;
    default: throw  new Error('no offerMakeType provided!')
  }
};

export default offerMakeToFormName;