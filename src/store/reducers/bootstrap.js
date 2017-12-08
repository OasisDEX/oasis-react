import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

const initialState = Immutable.fromJS({});

const NETWORK_INITIALIZED = 'BOOTSTRAP/NETWORK_INITIALIZED';



const networkInitialized = createAction(
  NETWORK_INITIALIZED
);

const actions = {
  networkInitialized
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
