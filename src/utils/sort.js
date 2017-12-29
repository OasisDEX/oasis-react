import isArray from 'lodash/isArray';
import orderBy from 'lodash/orderBy';

export const ASCENDING = 'asc';
export const DESCENDING = 'desc';

const orderByTimestamp = (data, sortOrder = ASCENDING) => {
  if(isArray(data)) {
    return orderBy(data, (el) => parseInt(el.timestamp), sortOrder);
  } else {
    throw new Error('Please provide instance of array.');
  }
};

export {
  orderByTimestamp
}