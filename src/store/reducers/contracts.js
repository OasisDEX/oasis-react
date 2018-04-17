import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { TOKEN_WRAPPED_GNT } from '../../constants';

const initialState = fromJS({
  implementsTokenWrappers: [
    TOKEN_WRAPPED_GNT
  ]
});

const INIT = 'CONTRACTS/INIT';

const Init = createAction(
  INIT,
  () => null,
);

const actions = {
  Init,
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
