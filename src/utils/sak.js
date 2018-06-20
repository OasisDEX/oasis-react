import balances from '../store/reducers/balances';
import web3, {web3p} from "../bootstrap/web3";
import markets from "../store/selectors/markets";
import {ETH_UNIT_ETHER} from "../constants";
import { getMarketContractInstance } from '../bootstrap/contracts';
import BigNumber from "bignumber.js";

const fromWei = (x) =>  web3.fromWei(x, ETH_UNIT_ETHER);

const toString = (x) => x.toString();

const print = (x) => console.log(x)

const marketAddress = (store) =>
  () => markets.activeMarketAddress(store.getState());

const getTokenAllowance = (store) =>
  (tokenName) => {
    const x = balances
      .actions
      .getDefaultAccountTokenAllowanceForAddress(tokenName, marketAddress(store)())((a) => store.dispatch(a), () => store.getState());

    return x
      .then(({value}) => value)
      .then(fromWei)
      .then(toString)
      .then(print);
  }

const disableTokenTrust = (store) =>
  (tokenName) =>
    balances.actions.setTokenTrustAddressDisabled(tokenName, marketAddress(store)()).payload
      .then(watch);

const enableTokenTrust = (store) =>
  (tokenName) =>
    balances.actions.setTokenTrustAddressEnabled(tokenName, marketAddress(store)()).payload
      .then(watch);

const watch = (txHash) => {
  const filter = web3.eth.filter('latest');
  console.log(`Watching transaction: ${txHash}`);
  filter.watch(function(error) {
    if(error) {
      console.log("Watch error:", error);
      return;
    }
    web3p.eth.getTransactionReceipt(txHash)
      .then((receipt) => {
        if(receipt) {
          console.log(`Transaction: ${txHash}, status: ${receipt.status === '0x1' ? 'success' : 'failure'}`, receipt);
          filter.stopWatching();
        }
      });
  });
};

const logTake = (fromBlock, toBlock ) => {
  getMarketContractInstance().LogTake({}, {fromBlock, toBlock})
    .get((err, logTakesList) => {
      console.log('logTakesList', fromBlock, toBlock, logTakesList);
    });
};

const loadOffer = (offerId) => {
  getMarketContractInstance().offers(offerId)
    .then((o) => o.map(x => x.toString()))
    .then(print);
}

export default (store) => {
  window.sak = {
    getTokenAllowance: getTokenAllowance(store),
    disableTokenTrust: disableTokenTrust(store),
    enableTokenTrust: enableTokenTrust(store),
    state: () => store.getState().toJS(),
    logTake,
    BigNumber: (n) => new BigNumber(n),
    loadOffer
  };
}