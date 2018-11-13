import Web3 from "web3";
import { fromJS } from "immutable";
import { detectNetworkChange } from "./network";
import networkReducer from "../store/reducers/network";
import platformReducer from "../store/reducers/platform";
import {
  SUBSCRIPTIONS_TOKEN_TRANSFER_EVENTS,
  SUBSCRIPTIONS_TOKEN_TRANSFER_HISTORY_EVENTS,
  SUBSCRIPTIONS_USER_LOG_TAKE_EVENTS,
} from '../constants';
import { solSha3 } from '../utils/solSha3';

const web3 = new Web3();

export default web3;

let web3p = null;

const subscriptions = {
  tokenTransferEventSubs: fromJS({}),
  transferHistoryEventSubs: fromJS({}),
  wrapUnwrapHistoryEventSubs: fromJS({}),
  ethBalanceChangeEventSub: null,
  userMarketHistoryEventSubs: fromJS({ makes: null, takes: null })
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
  userMarketHistoryEventSubs
}) => {
  if (userMarketHistoryEventSubs) {
    subscriptions.userMarketHistoryEventSubs = subscriptions.transferHistoryEventSubs.set(
      userMarketHistoryEventSubs.key,
      userMarketHistoryEventSubs.value
    );
  } else if (tokenTransferEventSubs) {
    subscriptions.tokenTransferEventSubs = tokenTransferEventSubs;
  } else if (transferHistoryEventSub) {
    subscriptions.transferHistoryEventSubs = subscriptions.transferHistoryEventSubs.set(
      transferHistoryEventSub.key,
      transferHistoryEventSub.value
    );
  } else if (wrapUnwrapHistoryEventSub) {
    subscriptions.wrapUnwrapHistoryEventSubs = subscriptions.wrapUnwrapHistoryEventSubs.set(
      wrapUnwrapHistoryEventSub.key,
      wrapUnwrapHistoryEventSub.value
    );
  } else if (ethBalanceChangeEventSub) {
    subscriptions.ethBalanceChangeEventSub = ethBalanceChangeEventSub;
  }
};

const getSubscriptionsByType = group => {
  switch (group) {
    case SUBSCRIPTIONS_USER_LOG_TAKE_EVENTS:
      return subscriptions.userMarketHistoryEventSubs;
  }
};

const getSubscriptionsByTypeAndTag = (group, tag) => {
  switch (group) {
    case SUBSCRIPTIONS_USER_LOG_TAKE_EVENTS:
      return subscriptions.userMarketHistoryEventSubs.get(tag);
  }
};

const clearAccountSpecificSubscriptions = ({ dispatch }) => {
  subscriptions.tokenTransferEventSubs
    .valueSeq()
    .forEach(sub => sub.stopWatching());
  dispatch(
    platformReducer.actions.unregisterSubscriptionByType(
      SUBSCRIPTIONS_TOKEN_TRANSFER_EVENTS
    )
  );

  subscriptions.transferHistoryEventSubs
    .valueSeq()
    .forEach(sub => sub.stopWatching());
  dispatch(
    platformReducer.actions.unregisterSubscriptionByType(
      SUBSCRIPTIONS_TOKEN_TRANSFER_HISTORY_EVENTS
    )
  );
  subscriptions.userMarketHistoryEventSubs
    .valueSeq()
    .forEach(sub => sub.stopWatching());
  dispatch(
    platformReducer.actions.unregisterSubscriptionByType(
      SUBSCRIPTIONS_USER_LOG_TAKE_EVENTS
    )
  );

  subscriptions.wrapUnwrapHistoryEventSubs
    .valueSeq()
    .forEach(sub => sub.stopWatching());
  subscriptions.ethBalanceChangeEventSub.stopWatching();
  subscriptions.tokenTransferEventSubs = fromJS({});
  subscriptions.transferHistoryEventSubs = fromJS({});
  subscriptions.wrapUnwrapHistoryEventSubs = fromJS({});
  subscriptions.ethBalanceChangeEventSub = null;
  subscriptions.userMarketHistoryEventSubs = fromJS({});
};

const init = async (dispatch) => {
  if (window.ethereum) {
    web3.setProvider(window.ethereum);
    web3p = new window.Proxy(web3, proxiedWeb3Handler);
    await dispatch(
      networkReducer.actions.setWaitingForNetworkAccess(true)
    );
    window.ethereum.enable().then(() => {
      dispatch(
        networkReducer.actions.setWaitingForNetworkAccess(false)
      );
    }).catch(e => {
      console.log(e);
      dispatch(
        networkReducer.actions.setWaitingForNetworkAccess(false)
      );
      dispatch(platformReducer.actions.accountLocked());
    });
    setInterval(detectNetworkChange, 500);
  } else if (window.web3) {
    web3.setProvider(window.web3.currentProvider);
    web3p = new window.Proxy(web3, proxiedWeb3Handler);
    setInterval(detectNetworkChange, 500);
  } else {
    console.info("Cant connect to inPage Provider!");
    fetch(settings.nodeURL)
      .then(
        () => {
          console.info("Connecting to local Parity node");
          web3.setProvider(new Web3.providers.HttpProvider(settings.nodeURL));
          web3p = new window.Proxy(web3, proxiedWeb3Handler);
        },
        () => {}
      )
      .catch(() => console.info("Cant connect to local node!"));
  }
};
window.solSha3 = solSha3;

export {
  init,
  web3p,
  registerAccountSpecificSubscriptions,
  getSubscriptionsByType,
  getSubscriptionsByTypeAndTag,
  clearAccountSpecificSubscriptions
};
