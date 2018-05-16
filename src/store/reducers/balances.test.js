import thunk from 'redux-thunk';
import thunk2Data from '../thunk2Data';
import configureMockStore from 'redux-mock-store'

import { fromJS } from 'immutable';

import {
  ETH_UNIT_ETHER,
  ETH_UNIT_WEI,
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED_MIN_MAX,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED,
} from '../../constants';

import balances from './balances'

import each from 'jest-each';

const testCases = [
  ['MKR', TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED, TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED, 0, false],
  ['MKR', TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED, TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED, 1, false],
  ['MKR', TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED, TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED, 0, false],
  ['MKR', TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED, TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED, 1, false],
  ['DAI', TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED, TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED, 1, true],
]

each(testCases).describe(
  "setTokenAllowanceTrustEpic",
  (tokenName, previousAllowance, newAllowance, expectedNoCalls, expectedToTrow) =>
{

  test(`token: ${tokenName}, status: ${previousAllowance} set to: ${newAllowance}`, () => {
    const store = configureMockStore([thunk2Data(), thunk])({});

    const handleTransactionMock = jest.fn();

    const meat = () => store.dispatch(balances.actions.setTokenAllowanceTrustEpic({
        tokenName: tokenName,
        newAllowanceTrustStatus: newAllowance,
        allowanceSubjectAddress: 'mock address'
      },
      {},
      {
        defaultAccount: () => '',
        tokenAllowanceTrustStatus: () => previousAllowance,
        getErc20Tokens: () => fromJS(['MKR']),
        handleTrans: handleTransactionMock
      }));

    if(expectedToTrow) {
      expect(meat).toThrow();
    } else {
      meat();

      expect(store.getActions()).toMatchSnapshot();

      expect(handleTransactionMock.mock.calls.length).toBe(expectedNoCalls);

      if (expectedNoCalls > 0) {
        expect(handleTransactionMock.mock.calls[0][0]).toMatchSnapshot();
      }
    }
  });
});
