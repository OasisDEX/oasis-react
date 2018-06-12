import Web3 from "web3";
import { fromJS } from "immutable";
import platformReducer from '../store/reducers/platform';
import { SUBSCRIPTIONS_TOKEN_TRANSFER_EVENTS, SUBSCRIPTIONS_TOKEN_TRANSFER_HISTORY_EVENTS } from '../constants';

const web3 = new Web3();

export default web3;

let web3p = null;

const subscriptions = {
  tokenTransferEventSubs: fromJS({}),
  transferHistoryEventSubs: fromJS({}),
  wrapUnwrapHistoryEventSubs: fromJS({}),
  ethBalanceChangeEventSub: null
};

const settings = require("../settings");

const promisify = inner =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  );

const proxiedWeb3Handler = {
  get: (target, name) => {
    const inner = target[name];
    if (inner instanceof Function) {
      return (...args) => promisify(cb => inner(...args, cb));
    } else if (typeof inner === "object") {
      return new window.Proxy(inner, proxiedWeb3Handler);
    } else {
      return inner;
    }
  }
};

const registerAccountSpecificSubscriptions = ({
  tokenTransferEventSubs,
  transferHistoryEventSub,
  wrapUnwrapHistoryEventSub,
  ethBalanceChangeEventSub,
}) => {
  if (tokenTransferEventSubs) {
    subscriptions.tokenTransferEventSubs = tokenTransferEventSubs;
  } else if (transferHistoryEventSub) {
    subscriptions.transferHistoryEventSubs = subscriptions.transferHistoryEventSubs.set(
      transferHistoryEventSub.key, transferHistoryEventSub.value
    );
  } else if (wrapUnwrapHistoryEventSub) {
    subscriptions.wrapUnwrapHistoryEventSubs = subscriptions.wrapUnwrapHistoryEventSubs.set(
      wrapUnwrapHistoryEventSub.key, wrapUnwrapHistoryEventSub.value
    );
  } else if (ethBalanceChangeEventSub) {
    subscriptions.ethBalanceChangeEventSub = ethBalanceChangeEventSub
  }
};

const getSubscriptions = () => subscriptions;

const clearAccountSpecificSubscriptions = ({ dispatch }) => {
  subscriptions.tokenTransferEventSubs.valueSeq().forEach(sub => sub.stopWatching());
  dispatch(platformReducer.actions.unregisterSubscriptionByType(SUBSCRIPTIONS_TOKEN_TRANSFER_EVENTS));

  subscriptions.transferHistoryEventSubs.valueSeq().forEach(sub => sub.stopWatching());
  dispatch(platformReducer.actions.unregisterSubscriptionByType(SUBSCRIPTIONS_TOKEN_TRANSFER_HISTORY_EVENTS));

  subscriptions.wrapUnwrapHistoryEventSubs.valueSeq().forEach(sub => sub.stopWatching());
  subscriptions.ethBalanceChangeEventSub.stopWatching();
  subscriptions.tokenTransferEventSubs = fromJS({});
  subscriptions.transferHistoryEventSubs = fromJS({});
  subscriptions.wrapUnwrapHistoryEventSubs = fromJS({});
  subscriptions.ethBalanceChangeEventSub = null;
};

const init = () => {
  if (web3 && window.web3) {
    web3.setProvider(window.web3.currentProvider);
    web3p = new window.Proxy(web3, proxiedWeb3Handler);
  } else {
    console.info("Cant connect to inPage Provider!");
    fetch(settings.nodeURL).then(
      () => {
        console.info("Connecting to local Parity node");
        web3.setProvider(new Web3.providers.HttpProvider(settings.nodeURL));
        web3p = new window.Proxy(web3, proxiedWeb3Handler);
      },() => {}
    ).catch(() => console.info("Cant connect to local node!"));
  }

};

export {
  init,
  web3p,
  registerAccountSpecificSubscriptions,
  getSubscriptions,
  clearAccountSpecificSubscriptions
};
