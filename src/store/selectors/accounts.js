import { createSelector } from 'reselect';

const acc = s => s.get('accounts');

const defaultAccount = createSelector(
  acc, (s) => s.get('defaultAccount')
);

const accounts = createSelector(
  acc, (s) => s.get('accounts')
);

export default {
  state: acc,
  defaultAccount,
  accounts
}