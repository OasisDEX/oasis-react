import network from '../store/selectors/network';
import platform from '../store/selectors/platform';

let getState = null;

const init = (getStateFunction) => {
  getState = getStateFunction;
};

const getNetworkMeta = () => network.activeNetworkMeta(getState());
const getActiveNetworkAvgBlocksPerDay = () => parseInt(getNetworkMeta().get('avgBlocksPerDay'));

export const isLeapYear = (year) => year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);

export const DAY = 'TIME_SPAN/DAY';
export const WEEK = 'TIME_SPAN/WEEK';
export const TWO_WEEKS = 'TIME_SPAN/TWO_WEEKS';
export const MONTH = 'TIME_SPAN/MONTH';
export const QUARTER_OF_YEAR = 'TIME_SPAN/QUARTER_OF_YEAR';
export const HALF_OF_YEAR = 'TIME_SPAN/HALF_OF_YEAR';
export const YEAR = 'TIME_SPAN/YEAR';
export const TWO_YEARS = 'TIME_SPAN/TWO_YEARS';


export const getNumberOfDaysInTheYear = (year) => isLeapYear(year) ? 366 : 365;
const avgBlockPerDefaultPeriod = () => avgBlockPer(platform.defaultPeriod(getState()));

const avgBlockPerActivePeriod = () => avgBlockPer(platform.activePeriod(getState()));

const avgBlockPer = (period) => {
  const avgBlocksPerDay = getActiveNetworkAvgBlocksPerDay();
  switch (period) {
    case DAY: return avgBlocksPerDay;
    case WEEK: return 7 * avgBlocksPerDay;
    case TWO_WEEKS: return 14 * avgBlocksPerDay;
    default: throw new Error('Wrong time span provided!');
  }
};

export default {
  init,
  avgBlockPer,
  avgBlockPerActivePeriod,
  avgBlockPerDefaultPeriod
}

