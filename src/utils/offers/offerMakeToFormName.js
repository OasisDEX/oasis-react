import { MAKE_BUY_OFFER, MAKE_SELL_OFFER,
         MAKE_SELL_OFFER_FORM_NAME, MAKE_BUY_OFFER_FORM_NAME} from '../../constants';

const offerMakeToFormName = (offerMakeType) => {
  switch (offerMakeType) {
    case MAKE_SELL_OFFER: return MAKE_SELL_OFFER_FORM_NAME;
    case MAKE_BUY_OFFER: return MAKE_BUY_OFFER_FORM_NAME;
    default: throw  new Error(`Wrong offerMakeType: ${offerMakeType}!`)
  }
};

const formNameToOfferMake = (formName) => {
  switch (formName) {
    case "makeBuyOffer": return MAKE_BUY_OFFER;
    case "makeSellOffer": return MAKE_SELL_OFFER;
    default: throw  new Error(`Wrong formName: ${formName}!`)
  }
};

export {
  offerMakeToFormName,
  formNameToOfferMake
};