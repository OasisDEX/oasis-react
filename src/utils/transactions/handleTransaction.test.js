import thunk from 'redux-thunk';
import thunk2Data from '../../store/thunk2Data';
import configureMockStore from 'redux-mock-store'

import { fromJS } from 'immutable';

import {handleTransaction} from './handleTransaction'

import each from 'jest-each';


describe("handleTransaction", () => {
  test('transactionType not set, should throw error', async () => {
    expect(() => {
      handleTransaction({});
    }).toThrow();
  });
});
