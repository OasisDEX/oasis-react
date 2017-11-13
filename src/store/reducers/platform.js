import { createAction, handleActions } from 'redux-actions';
import Immutable                       from 'immutable';
import web3                            from '../../bootstrap/web3';

import { fulfilled, pending, rejected } from '../../utils/store';

const initialState = Immutable.fromJS({});

const INIT = 'PLATFORM/INIT';
const Init = createAction(
    INIT,
    async () => new Promise( (resolve, reject)=> {} )
)
const PlatformInit = () => (dispatch, getState) => {
    const InitActionInstance = dispatch(Init);
    console.log(InitActionInstance)
}



const actions = {
  PlatformInit
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
