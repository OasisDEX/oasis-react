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

const activePeriod = createSelector(
  platform,
  state => state.get('activePeriod')
);

const contractsLoaded = createSelector(
  platform,
  state => state.get('contractsLoaded')
);


const activePeriodAvgBlockNumber = createSelector(
  platform,
  state => period.avgBlockPer(state.get('activePeriod'))
);


const defaultPeriodAvgBlockNumber = createSelector(
  platform,
  state => period.avgBlockPer(state.get('defaultPeriod'))
);


const activeOfferType = createSelector(
  platform,
  state => state.get('activeOfferType')
);


export default {
  state: platform,
  isAccountLocked,
  defaultPeriod,
  activePeriod,
  defaultPeriodAvgBlockNumber,
  activePeriodAvgBlockNumber,
  contractsLoaded,
  activeOfferType
};