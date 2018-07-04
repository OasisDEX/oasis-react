import { fromJS } from "immutable";
import { createSelector } from "reselect";
import reselect from "../../utils/reselect";
import { TRANSFER_HISTORY_LOAD_STATUS_PENDING } from "../reducers/transferHistory";
import accounts from "./accounts";

const transferHistory = s => s.get("transferHistory");

const getTokenTransferHistoryStatus = createSelector(
  transferHistory,
  reselect.getProps,
  (s, tokeName) => s.getIn(["tokensLoadingStatus", tokeName, "status"])
);

const isTokenTransferHistoryLoading = createSelector(
  transferHistory,
  reselect.getProps,
  (s, tokeName) =>
    s.getIn(["tokensLoadingStatus", tokeName, "status"]) ===
    TRANSFER_HISTORY_LOAD_STATUS_PENDING
);

const hasAccountEntry = createSelector(
  transferHistory,
  reselect.getProps,
  (s, account) =>
    s.hasIn(['transferHistory', account])
);

const tokenTransferHistory = createSelector(
  transferHistory,
  reselect.getProps,
  accounts.defaultAccount,
  (s, tokenName, defaultAccount) =>
    s.hasIn(["transferHistory", defaultAccount])
      ? s
          .getIn(["transferHistory", defaultAccount])
          .filter(thItem => thItem.get("tokenName") === tokenName)
          .sort((p, n) => (p.get("timestamp") > n.get("timestamp") ? -1 : 1))
      : fromJS([])
);

const isInitializedForAccount = createSelector(
  transferHistory,
  accounts.defaultAccount,
  (s, accountAddress) => s.getIn(["historyLoadedForAddress", accountAddress])
);

export default {
  state: transferHistory,
  getTokenTransferHistoryStatus,
  isTokenTransferHistoryLoading,
  tokenTransferHistory,
  isInitializedForAccount,
  hasAccountEntry
};
