import { orderBy, isArray } from 'lodash';

export const SORT_ASC = 'asc';
export const SORT_DESC = 'desc';

const orderBytTimestamp = (data, sortOrder = SORT_ASC) => {
  if(isArray(data)) {
    return orderBy(data, (el) => parseInt(el.timestamp), sortOrder);
  } else {
    throw new Error('Please provide instance of array.');
  }
};

export {
  orderBytTimestamp
}