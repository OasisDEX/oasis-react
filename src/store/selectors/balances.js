import { createSelector } from "reselect";
import BigNumber from "bignumber.js";
import reselect from "../../utils/reselect";
import web3 from "../../bootstrap/web3";
import {memoize} from "lodash";
import {
  ETH_UNIT_ETHER,
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED_MIN
} from "../../constants";

import tokens from "./tokens";
import { getMarketContractInstance } from "../../bootstrap/contracts";

const balances = s => s.get("balances");

const tokenAllowances = createSelector(balances, s => s.get("tokenAllowances"));

const tokenBalances = createSelector(balances, s => s.get("tokenBalances"));

const tokenBalance = createSelector(
  tokenBalances,
  reselect.getProps,
  (s, { tokenName, balanceUnit = ETH_UNIT_ETHER, toBigNumber = true }) => {
    const tokenBalance = s.get(tokenName);
    if (tokenBalance) {
      if (toBigNumber) {
        return web3.fromWei(new BigNumber(s.get(tokenName), 10), balanceUnit);
      } else {
        return web3.fromWei(s.get(tokenName), balanceUnit);
      }
    } else {
      return null;
    }
  }
);

const tokenBalanceMemo = createSelector(
  tokenBalances,
  s => memoize((tokenName, balanceUnit = ETH_UNIT_ETHER, toBigNumber = true) => {
    const tokenBalance = s.get(tokenName);
    if (tokenBalance) {
      if (toBigNumber) {
        return web3.fromWei(new BigNumber(s.get(tokenName), 10), balanceUnit);
      } else {
        return web3.fromWei(s.get(tokenName), balanceUnit);
      }
    } else {
      return null;
    }
  })
);

const tokenAllowanceTrustStatus = createSelector(
  balances,
  reselect.getProps,
  (s, { tokenName, allowanceSubjectAddress }) => {
    const tokenAllowance = s.getIn([
      "tokenAllowances",
      tokenName,
      allowanceSubjectAddress
    ]);
    if (tokenAllowance) {
      const tokenAllowanceBN = new BigNumber(tokenAllowance);
      const tokenTrustEnabledMinBN = new BigNumber(
        TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED_MIN
      );
      if (tokenAllowanceBN.gte(tokenTrustEnabledMinBN)) {
        return TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED;
      } else {
        return TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED;
      }
    } else {
      return null;
    }
  }
);

const tokenAllowanceStatusForActiveMarket = createSelector(
  (...args) => args,
  ([state, { tokenName }]) =>
    tokenAllowanceTrustStatus(state, {
      tokenName,
      allowanceSubjectAddress: getMarketContractInstance().address
    })
);

const activeBaseTokenBalance = createSelector(
  tokenBalances,
  tokens.activeTradingPairBaseToken,
  (tokenBalances, baseToken) => tokenBalances.get(baseToken)
);

const ethBalance = createSelector(balances, s => s.get("ethBalance"));
const isUserBalanceZero = createSelector(
  ethBalance,
  balance => parseInt(balance) === 0
);

const activeQuoteTokenBalance = createSelector(
  tokenBalances,
  tokens.activeTradingPairQuoteToken,
  (tokenBalances, quoteToken) => tokenBalances.get(quoteToken)
);

const latestBalancesSyncBlockNumber = createSelector(
  balances,
  s => s.get('latestBalancesSyncBlockNumber')
);

const latestBalancesSyncTimestamp = createSelector(
  balances,
  s => s.get('latestBalancesSyncTimestamp')
);


export default {
  state: balances,
  tokenAllowances,
  tokenBalances,
  // tokenAllowance,
  tokenBalance,
  tokenBalanceMemo,
  ethBalance,
  tokenAllowanceTrustStatus,
  activeBaseTokenBalance,
  activeQuoteTokenBalance,
  tokenAllowanceStatusForActiveMarket,
  isUserBalanceZero,
  latestBalancesSyncBlockNumber,
  latestBalancesSyncTimestamp
};
