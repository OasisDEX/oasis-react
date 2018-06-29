import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../reducers/offerTakes';
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../../constants';
import offerMakes from './offerMakes';
import offerTakes from './offerTakes';
import { createSelector } from "reselect";
import {memoize} from 'lodash';

const isVolumeOrPriceEmptyOrZero = createSelector(
  offerTakes.isVolumeEmptyOrZero,
  offerMakes.isVolumeOrPriceEmptyOrZero,
  (isVolumeEmptyOrZero, isVolumeOrPriceEmptyOrZero) => memoize(offerType => {
    switch (offerType) {
      case TAKE_SELL_OFFER:
      case TAKE_BUY_OFFER:
        return isVolumeEmptyOrZero;
      case MAKE_SELL_OFFER:
      case MAKE_BUY_OFFER:
        return isVolumeOrPriceEmptyOrZero(offerType);
    }
  })
);
export default isVolumeOrPriceEmptyOrZero;
