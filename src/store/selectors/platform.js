import { createSelector } from 'reselect';
import period from '../../utils/period';

const platform = state => state.get('platform');

const isAccountLocked = createSelector(
  platform,
  state => state.get('metamaskLocked')
);

const defaultPeriod = createSelector(
  platform,
  state => state.get('defaultPeriod')
);

const contractsLoaded = createSelector(
  platform,
  state => state.get('contractsLoaded')
);


const defaultPeriodAvgBlockNumber = createSelector(
  platform,
  state => period.avgBlockPer(state.get('defaultPeriod'))
);

export default {
  state: platform,
  isAccountLocked,
  defaultPeriod,
  defaultPeriodAvgBlockNumber,
  contractsLoaded
};