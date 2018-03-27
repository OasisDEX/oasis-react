import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';
import { TRANSFER_HISTORY_LOAD_STATUS_PENDING } from '../reducers/transferHistory';

const transferHistory = s => s.get('transferHistory');

const getTokenTransferHistoryStatus = createSelector(
  transferHistory,
  reselect.getProps,
  (s, tokeName) => s.getIn(['tokensLoadingStatus', tokeName])
);

const isTokenTransferHistoryLoading = createSelector(
  transferHistory,
  reselect.getProps,
  (s, tokeName) => s.getIn(['tokensLoadingStatus', tokeName, 'status']) === TRANSFER_HISTORY_LOAD_STATUS_PENDING
);

const tokenTransferHistory = createSelector(
  transferHistory,
  reselect.getProps,
  (s, tokenName) =>
    s.get('transferHistory')
      .filter(thItem => thItem.get('tokenName') === tokenName)
      .sort(
        (p, n) => p.get('timestamp') > n.get('timestamp') ? -1 : 1
      )
);


export default {
  state: transferHistory,
  getTokenTransferHistoryStatus,
  isTokenTransferHistoryLoading,
  tokenTransferHistory
}