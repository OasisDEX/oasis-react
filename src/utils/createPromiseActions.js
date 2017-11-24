import { createAction } from 'redux-actions';
import * as storeHelpers from './store';

export function createPromiseActions(actionName,
                                     { pending, fulfilled, rejected } = {}) {
  return {
    'pending': createAction(
      storeHelpers.pending(actionName),
      pending ? pending : (v) => v,
    ),
    'fulfilled': createAction(
      [storeHelpers.fulfilled(actionName)],
      fulfilled ? fulfilled : (v) => v,
    ),
    'rejected': createAction(
      [storeHelpers.rejected(actionName)],
      rejected ? rejected : (v) => v,
    ),
  };
}
