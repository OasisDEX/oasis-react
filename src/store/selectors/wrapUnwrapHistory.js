import { createSelector } from 'reselect';
import { WRAP_UNWRAP_HISTORY_LOAD_STATUS_PENDING } from '../reducers/wrapUnwrapHistory';

const wrapUnwrapHistory = s => s.get('wrapUnwrapHistory');

const getTokenWrapUnwrapHistoryStatus = createSelector(
  wrapUnwrapHistory,
  s => s.get('historyLoadingStatus')
);

const isTokenWrapUnwrapHistoryLoading = createSelector(
  wrapUnwrapHistory,
  s => s.get('historyLoadingStatus') === WRAP_UNWRAP_HISTORY_LOAD_STATUS_PENDING
);

const tokenWrapUnwrapHistory = createSelector(
  wrapUnwrapHistory,
  s =>
    s.get('wrapUnwrapHistory')
      .sort(
        (p, n) => p.get('timestamp') > n.get('timestamp') ? -1 : 1
      )
);


export default {
  state: wrapUnwrapHistory,
  getTokenWrapUnwrapHistoryStatus,
  isTokenWrapUnwrapHistoryLoading,
  tokenWrapUnwrapHistory
}