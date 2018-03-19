import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';

const tokenSelectors = s => s.get('tokenSelectors');

const selectedToken = createSelector(
  tokenSelectors,
  reselect.getProps,
  (s, selectorName) => s.get(selectorName)
);

export default {
  state: tokenSelectors,
  selectedToken
}