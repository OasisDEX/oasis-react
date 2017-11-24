import { createSelector } from 'reselect';

const state = s => s.get('platform');

const isAccountLocked = createSelector(
  state,
  (s) => {
    return s.get('metamaskLocked');
  },
);

export default {
  state,
  isAccountLocked
};