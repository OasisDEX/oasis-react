import { createSelector } from 'reselect';
import timeSpan from '../../utils/timeSpan';

const state = s => s.get('platform');

const isAccountLocked = createSelector(
  state,
  (s) => {
    return s.get('metamaskLocked');
  },
);

const defaultTimeSpan = createSelector(
  state,
  (s) => {
    return s.get('defaultTimeSpan');
  },
);

const defaultTimeSpanAvgBlockNumber = createSelector(
  state,
  (s) => timeSpan.avgBlockPer(s.get('defaultTimeSpan'))
);


export default {
  state,
  isAccountLocked,
  defaultTimeSpan,
  defaultTimeSpanAvgBlockNumber
};