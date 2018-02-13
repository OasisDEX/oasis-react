import { createSelector } from 'reselect';

const offerTakes = state => state.get('offerTakes');

const activeOfferTake = createSelector(
  offerTakes, s => s.get('currentOfferTake')
);

export default {
  state: offerTakes,
  activeOfferTake
}