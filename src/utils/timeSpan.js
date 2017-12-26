import network from '../store/selectors/network';
import platform from '../store/selectors/platform';

let getState = null;

const init = (getStateFunction) => {
  getState = getStateFunction;
};

const getNetworkMeta = () => network.getActiveNetworkMeta(getState());
const getActiveNetworkAvgBlocksPerDay = () => parseInt(getNetworkMeta().get('avgBlocksPerDay'));

export const isLeapYear = (year) => year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);

export const TIME_SPAN_DAY = 'TIME_SPAN/DAY';
export const TIME_SPAN_WEEK = 'TIME_SPAN/WEEK';
export const TIME_SPAN_TWO_WEEKS = 'TIME_SPAN/TWO_WEEKS';
export const TIME_SPAN_MONTH = 'TIME_SPAN/MONTH';
export const TIME_SPAN_QUARTER_OF_YEAR = 'TIME_SPAN/QUARTER_OF_YEAR';
export const TIME_SPAN_HALF_OF_YEAR = 'TIME_SPAN/HALF_OF_YEAR';
export const TIME_SPAN_YEAR = 'TIME_SPAN/YEAR';
export const TIME_SPAN_TWO_YEARS = 'TIME_SPAN/TWO_YEARS';


export const getNumberOfDaysInTheYear = (year) => isLeapYear(year) ? 366 : 365;
const avgBlockPerDefaultTimeSpan = () => avgBlockPer(platform.defaultTimeSpan(getState()));

const avgBlockPer = (timeSpan) => {
  const avgBlocksPerDay = getActiveNetworkAvgBlocksPerDay();
  switch (timeSpan) {
    case TIME_SPAN_DAY: return avgBlocksPerDay;
    case TIME_SPAN_WEEK: return 7 * avgBlocksPerDay;
    case TIME_SPAN_TWO_WEEKS: return 14 * avgBlocksPerDay;
    default: throw new Error('Wrong time span provided!');
  }
};



export default {
  init,
  avgBlockPer,
  avgBlockPerDefaultTimeSpan
}

