import MockDate from 'mockdate';
import moment from 'moment-timezone';
import {createAction} from 'redux-actions';
import BigNumber from 'bignumber.js';

export function mockDate(date, block) {
  try {
    MockDate.set(date);
    moment.tz.setDefault('UTC');
    return block.call();
  } finally {
    MockDate.reset();
    moment.tz.setDefault(moment.tz.guess());
  }
}

export function mockDatePromise(date, promise) {
  if (!promise)
    return null;
  MockDate.set(date);
  moment.tz.setDefault('UTC');
  return promise.then((v) => {
    MockDate.reset();
    moment.tz.setDefault(moment.tz.guess());
    return v;
  });
}

export function mockAction(name) {
  return createAction('MOCK___' + name, (...args) => args);
}

export function dispatchMockAction(name, dispatch) {
  return (...args) => dispatch(
    createAction('MOCK___' + name, (...args) => args)(...args)
  );
}

export function mockEpic(name, dispatch) {
  return (f) => (...args) => async () => {
    dispatch(createAction('MOCK___' + name, (...args) => args)(...args));
    return f(...args);
  };
}

export function asyncMock(mock) {
  return async (...args) => mock(...args);
}

export function wei(x) {
  return new BigNumber(1000000000000000000).mul(x).toString();
}
