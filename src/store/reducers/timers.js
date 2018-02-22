import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { createPromiseActions } from '../../utils/createPromiseActions';

const initialState = fromJS({
  timestamp: null,
  timeoutId: null,
});

const Init = createPromiseActions('TIMERS/INIT');
const InitEpic = () => (dispatch) => {
  dispatch(Init.pending());
  const tid = setInterval(
    () => {
      const currentTimestamp = parseInt(Date.now() / 1000);
      dispatch(updateTimestamp(currentTimestamp));
    }, 1000);
    dispatch(Init.fulfilled({ tid }))
};
const actions = {
  InitEpic
};

const updateTimestamp = createAction(
  'TIMERS/UPDATE_TIMESTAMP', ts => ts,
);

const reducer = handleActions({
  [updateTimestamp]: (state, { payload }) => state.set('timestamp', payload),
  [Init.fulfilled]: (state, { payload })=> state.set('timeoutId', payload.tid)
}, initialState);

export default {
  actions,
  reducer,
};
