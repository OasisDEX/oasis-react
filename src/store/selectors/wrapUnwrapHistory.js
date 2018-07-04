import { createSelector } from 'reselect';
import { fromJS } from 'immutable';
import {
  WRAP_UNWRAP_HISTORY_LOAD_STATUS_LOAD_STATUS_INITIALLY_LOADED,
  WRAP_UNWRAP_HISTORY_LOAD_STATUS_PENDING,
} from '../reducers/wrapUnwrapHistory';
import accounts from './accounts';
import reselect from '../../utils/reselect';

const wrapUnwrapHistory = s => s.get('wrapUnwrapHistory');

const getTokenWrapUnwrapHistoryStatus = createSelector(
  wrapUnwrapHistory,
  s => s.get('historyLoadingStatus')
);

const isTokenWrapUnwrapHistoryLoading = createSelector(
  wrapUnwrapHistory,
  s => s.get('historyLoadingStatus') === WRAP_UNWRAP_HISTORY_LOAD_STATUS_PENDING
);

const isTokenWrapUnwrapHistoryLoaded = createSelector(
  wrapUnwrapHistory,
  s => s.get('historyLoadingStatus') === WRAP_UNWRAP_HISTORY_LOAD_STATUS_LOAD_STATUS_INITIALLY_LOADED

);

const hasAccountEntry = createSelector(
  wrapUnwrapHistory,
  reselect.getProps,
  (s, account) =>
    s.hasIn(['wrapUnwrapHistory', account])
);

const tokenWrapUnwrapHistory = createSelector(
  wrapUnwrapHistory,
  accounts.defaultAccount,
  (s, defaultAccount) =>
    s.hasIn(['wrapUnwrapHistory', defaultAccount]) ?
    s.getIn(['wrapUnwrapHistory', defaultAccount]).sort(
        (p, n) => p.get('timestamp') > n.get('timestamp') ? -1 : 1
      ): fromJS([])
);

export default {
  state: wrapUnwrapHistory,
  hasAccountEntry,
  getTokenWrapUnwrapHistoryStatus,
  isTokenWrapUnwrapHistoryLoading,
  isTokenWrapUnwrapHistoryLoaded,
  tokenWrapUnwrapHistory
}