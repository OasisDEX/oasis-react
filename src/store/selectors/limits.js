import { createSelector } from 'reselect';

const state = s => s.get('limits');

const getTokenMinSell = createSelector(state);