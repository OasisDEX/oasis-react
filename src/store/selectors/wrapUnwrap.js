import { createSelector } from "reselect";
import balances from "./balances";
import { fromJS } from "immutable";
import { TOKEN_ETHER } from "../../constants";
import reselect from "../../utils/reselect";
import web3 from "../../bootstrap/web3";
import { formValueSelector } from "redux-form/immutable";
import accounts from "./accounts";

const wrapUnwrap = state => state.get("wrapUnwrap");

const wrapperTokenPairs = createSelector(wrapUnwrap, s =>
  s.get("wrapperTokenPairs")
);

const wrapUnwrapBalances = createSelector(
  wrapperTokenPairs,
  balances.tokenBalances,
  balances.ethBalance,
  (wrapperTokenPairs, tokenBalances, etherBalance) =>
    wrapperTokenPairs.map(wtp => {
      const [unwrappedToken, wrapperToken] = [
        wtp.get("unwrapped"),
        wtp.get("wrapper")
      ];
      const unwrappedBalance =
        unwrappedToken !== TOKEN_ETHER
          ? tokenBalances.get(unwrappedToken)
          : etherBalance;
      return fromJS({
        unwrappedToken,
        wrapperToken,
        unwrappedBalance,
        wrappedBalance: tokenBalances.get(wrapperToken)
      });
    })
);

const getBrokerAddress = createSelector(
  wrapUnwrap,
  accounts.defaultAccount,
  reselect.getProps,
  (s, defaultAccountAddress, tokenName) =>
    s.getIn(["brokerAddresses", defaultAccountAddress, tokenName])
);

const activeUnwrappedToken = createSelector(wrapUnwrap, s =>
  s.get("activeUnwrappedToken")
);

const activeWrappedToken = createSelector(
  wrapperTokenPairs,
  activeUnwrappedToken,
  (wtp, ut) => wtp.find(entry => entry.get("unwrapped") === ut).get("wrapper")
);

const getActiveWrapUnwrapPair = createSelector(
  wrapperTokenPairs,
  activeUnwrappedToken,
  (wtp, aut) => wtp.find(item => item.get("unwrapped") === aut)
);

const activeUnwrappedTokenBalance = createSelector(
  wrapUnwrapBalances,
  activeUnwrappedToken,
  (wub, activeUnwrappedToken, asBN = true) => {
    if (!activeUnwrappedToken) {
      return null;
    } else {
      const balance = wub
        .find(item => item.get("unwrappedToken") === activeUnwrappedToken)
        .get("unwrappedBalance");
      if (asBN && balance) {
        return web3.toBigNumber(balance);
      } else {
        return balance;
      }
    }
  }
);

const activeWrappedTokenBalance = createSelector(
  wrapUnwrapBalances,
  activeWrappedToken,
  (wub, activeWrappedToken, asBN = true) => {
    if (!activeWrappedToken) {
      return null;
    } else if (wub) {
      const balances = wub.find(
        item => item.get("wrapperToken") === activeWrappedToken
      );
      if (asBN && balances) {
        return web3.toBigNumber(balances.get("wrappedBalance"));
      } else if (balances) {
        return balances.get("wrappedBalance");
      } else {
        return null;
      }
    }
  }
);

const loadedBrokerContractsList = createSelector(wrapUnwrap, s =>
  s.get("loadedBrokerContracts")
);

const hasTokenBroker = createSelector(
  wrapUnwrap,
  accounts.defaultAccount,
  reselect.getProps,
  (s, defaultAccountAddress, tokenName) =>
    s.hasIn(["brokerAddresses", defaultAccountAddress, tokenName])
      ? web3
          .toBigNumber(
            s.getIn(["brokerAddresses", defaultAccountAddress, tokenName])
          )
          .gt(0)
      : false
);

const isTokenBrokerInitiallyLoaded = createSelector(
  wrapUnwrap,
  accounts.defaultAccount,
  reselect.getProps,
  (s, defaultAccountAddress, tokenName) =>
    s.getIn(["brokerAddresses", defaultAccountAddress, tokenName]) !== null
);

const isBrokerContractLoaded = createSelector(
  loadedBrokerContractsList,
  reselect.getProps,
  (lbcl, tokenName) => lbcl.includes(tokenName)
);

const wrapTokenformSelector = formName => formValueSelector(formName);
const unwrapTokenformSelector = formName => formValueSelector(formName);

const wrapTokenAmount = createSelector(
  (rootState, formName) =>
    wrapTokenformSelector(formName)(rootState, "amount"),
  wrapAmount => wrapAmount
);

const unwrapTokenAmount = createSelector(
  (rootState, formName) =>
    unwrapTokenformSelector(formName)(rootState, "amount"),
  wrapAmount => wrapAmount
);

const activeTokenWrapStatus = createSelector(wrapUnwrap, s =>
  s.get("activeTokenWrapStatus")
);

const activeTokenUnwrapStatus = createSelector(wrapUnwrap, s =>
  s.get("activeTokenUnwrapStatus")
);

export default {
  state: wrapUnwrap,
  wrapperTokenPairs,
  wrapUnwrapBalances,
  getBrokerAddress,
  activeUnwrappedToken,
  activeWrappedToken,
  activeUnwrappedTokenBalance,
  activeWrappedTokenBalance,
  getActiveWrapUnwrapPair,
  isBrokerContractLoaded,
  hasTokenBroker,
  isTokenBrokerInitiallyLoaded,
  activeTokenWrapStatus,
  activeTokenUnwrapStatus,
  wrapTokenAmount,
  unwrapTokenAmount
};
