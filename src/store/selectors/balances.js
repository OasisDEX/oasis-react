import { createSelector } from 'reselect';
import BigNumber from 'bignumber.js';
import reselect from '../../utils/reselect';
import web3 from '../../bootstrap/web3';
import { ETH_UNIT_ETHER } from '../../constants';
import {
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED_MIN,
} from '../reducers/balances';
import tokens from './tokens';

const balances = s => s.get('balances');

const tokenAllowances = createSelector(
  balances, (s) => s.getIn(['defaultAccount', 'tokenAllowances'])
);

const tokenBalances = createSelector(
  balances, (s) => s.getIn(['defaultAccount', 'tokenBalances'])
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


const tokenBalance = createSelector(
  tokenBalances,
  reselect.getProps,
  (s, { tokenName, balanceUnit = ETH_UNIT_ETHER, toBigNumber = true }) => {
    const tokenBalance = s.get(tokenName);
    if(tokenBalance) {
      if(toBigNumber) {
        return web3.fromWei(new BigNumber(s.get(tokenName), 10), balanceUnit);
      } else {
        return web3.fromWei(s.get(tokenName), balanceUnit);
      }
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
      if(tokenAllowanceBN.gte(tokenTrustEnabledMinBN)) {
        return TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED;
      } else {
        return TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED;
      }
    } else { return null; }
  }
);


const tokenAllowanceStatusForActiveMarket = createSelector(
  balances,
  reselect.getProps,
  (s, { tokenName }) => {
    const tokenAllowance = s.getIn([ 'tokenAllowances', tokenName, window.contracts.market.address]);
    if(tokenAllowance) {
      const tokenAllowanceBN = new BigNumber(tokenAllowance);
      const tokenTrustEnabledMinBN = new BigNumber(TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED_MIN);
      if(tokenAllowanceBN.gte(tokenTrustEnabledMinBN)) {
        return TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED;
      } else {
        return TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED;
      }
    } else { return null; }
  }
);


const activeBaseTokenBalance = createSelector(
  tokenBalances,
  tokens.activeTradingPairBaseToken,
  (tokenBalances, baseToken) => tokenBalances.get(baseToken)
);

const ethBalance = createSelector(
  balances,
  s => s.getIn(['defaultAccount', 'ethBalance'])
);


const activeQuoteTokenBalance = createSelector(
  tokenBalances,
  tokens.activeTradingPairQuoteToken,
  (tokenBalances, quoteToken) => tokenBalances.get(quoteToken)
);

export default {
  state: balances,
  tokenAllowances,
  tokenBalances,
  tokenAllowance,
  tokenBalance,
  ethBalance,
  tokenAllowanceTrustStatus,
  activeBaseTokenBalance,
  activeQuoteTokenBalance,
  tokenAllowanceStatusForActiveMarket
}