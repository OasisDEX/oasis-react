import { createSelector } from "reselect";
import period from "../../utils/period";
import network from "./network";
import reselect from "../../utils/reselect";
import { subscriptionGroupToKeyMap } from "../../constants";

const platform = state => state.get("platform");

const isAccountLocked = createSelector(platform, state =>
  state.get("accountLocked")
);

const defaultPeriod = createSelector(platform, state =>
  state.get("defaultPeriod")
);

const activePeriod = createSelector(platform, state =>
  state.get("activePeriod")
);

const contractsLoaded = createSelector(platform, state =>
  state.get("contractsLoaded")
);

const activePeriodAvgBlockNumber = createSelector(platform, state =>
  period.avgBlockPer(state.get("activePeriod"))
);

const defaultPeriodAvgBlockNumber = createSelector(platform, state =>
  period.avgBlockPer(state.get("defaultPeriod"))
);

const globalFormLock = createSelector(platform, s => s.get("globalFormLock"));

const isAppLoading = createSelector(platform, s => s.get("isAppLoading"));

const isMarketInitialized = createSelector(platform, s => s.get("marketInitialized"));


const allInitialSubscriptionsRegistered = createSelector(platform, s =>
  s.get("allInitialSubscriptionsRegistered")
);

const subscriptionsRegisteredMap = createSelector(platform, s =>
  s.get("subscriptionsRegistered")
);

const isSubscriptionRegistered = createSelector(
  subscriptionsRegisteredMap,
  reselect.getProps,
  (subscriptionsRegisteredMap, { subscriptionGroup, subscriptionType }) =>
    Boolean(
      subscriptionsRegisteredMap.getIn([
        subscriptionGroupToKeyMap[subscriptionGroup],
        subscriptionGroupToKeyMap[subscriptionType]
      ])
    )
);

const canRegisterSubscription = createSelector(
  network.isNodeSyncing,
  subscriptionsRegisteredMap,
  reselect.getProps,
  (
    isSyncing,
    subscriptionsRegisteredMap,
    { subscriptionGroup, subscriptionType }
  ) =>
    !isSyncing &&
    !subscriptionsRegisteredMap.getIn([
      subscriptionGroupToKeyMap[subscriptionGroup],
      subscriptionGroupToKeyMap[subscriptionType]
    ])
);

const canRegisterInitialSubscriptions = createSelector(
  network.isNodeSyncing,
  allInitialSubscriptionsRegistered,
  (isSyncing, asr) => !isSyncing && !asr
);

const activeNodeType = createSelector(
  platform,
  s => s.get("activeNodeType")
);

export default {
  state: platform,
  isAccountLocked,
  defaultPeriod,
  activePeriod,
  defaultPeriodAvgBlockNumber,
  activePeriodAvgBlockNumber,
  contractsLoaded,
  globalFormLock,
  isAppLoading,
  allInitialSubscriptionsRegistered,
  canRegisterInitialSubscriptions,
  canRegisterSubscription,
  isMarketInitialized,
  isSubscriptionRegistered,
  activeNodeType
};
