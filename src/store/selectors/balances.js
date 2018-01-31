import { createSelector } from 'reselect';
import BigNumber from 'bignumber.js';
import reselect from '../../utils/reselect';
import { formatAmount } from '../../utils/tokens/pair';
import web3 from '../../bootstrap/web3';
import { ETH_UNIT_ETHER } from '../../constants';
import {
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED_MAX, TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED_MIN,
  TOKEN_ALLOWANCE_TRUST_SUBJECT_TYPE_ADDRESS,
  TOKEN_ALLOWANCE_TRUST_SUBJECT_TYPE_MARKET,
} from '../reducers/balances';

const balances = s => s.get('balances');

const tokenAllowances = createSelector(
  balances, (s) => s.getIn(['defaultAccount', 'tokenAllowances'])
);

const tokenAllowance = createSelector(
  tokenAllowances,
  reselect.getProps,
  (s, { tokenName, allowanceUnit = ETH_UNIT_ETHER }) => {
    const tokenAllowance = s.getIn([tokenName]);
    if(tokenAllowance) {
      return web3.fromWei(new BigNumber(s.getIn([tokenName], 10)), allowanceUnit);
    } else {
      return null;
    }
  }
);

const tokenAllowanceTrustStatus = createSelector(
  balances,
  reselect.getProps,
  (s, { tokenName, allowanceSubjectAddress }) => {
    const tokenAllowance = s.getIn([ 'tokenAllowances', tokenName, allowanceSubjectAddress ]);
    if(tokenAllowance) {
      const tokenAllowanceBN = new BigNumber(tokenAllowance);
      const tokenTrustEnabledMinBN = new BigNumber(TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED_MIN);
      if(tokenAllowanceBN.toNumber() >= tokenTrustEnabledMinBN.toNumber()) {
        return TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED;
      } else {
        return TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED;
      }
    } else { return null; }
  }
);



export default {
  state: balances,
  tokenAllowances,
  tokenAllowance,
  tokenAllowanceTrustStatus
}