import { handleActions } from 'redux-actions';
import Immutable from 'immutable';


const initialState = Immutable.fromJS({
  watchers: [],
});


const actions = {
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
