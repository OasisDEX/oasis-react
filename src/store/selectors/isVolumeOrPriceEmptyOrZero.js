import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../reducers/offerTakes';
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../../constants';
import offerMakes from './offerMakes';
import offerTakes from './offerTakes';
import { createSelector } from "reselect";

const isVolumeOrPriceEmptyOrZero = createSelector(

  (
    rootState, offerType
  ) => {
    switch (offerType) {
      case TAKE_SELL_OFFER:
      case TAKE_BUY_OFFER:
        return offerTakes.isVolumeEmptyOrZero(rootState);
      case MAKE_SELL_OFFER:
      case MAKE_BUY_OFFER:
        return offerMakes.isVolumeOrPriceEmptyOrZero(rootState, offerType);
    }
  }, allowanceStatus => Boolean(allowanceStatus)
);
export default isVolumeOrPriceEmptyOrZero;
