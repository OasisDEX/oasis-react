import { createSelector } from 'reselect';

const state = s => s.get('accounts');

const defaultAccount = createSelector(
  state, (s) => s.get('defaultAccount')
);

const accounts = createSelector(
  state, (s) => s.get('accounts')
);

export default {
  state,
  defaultAccount,
  accounts
}