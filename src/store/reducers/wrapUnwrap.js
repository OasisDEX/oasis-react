import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { TOKEN_ETHER, TOKEN_GNOSIS, TOKEN_WRAPPED_ETH, TOKEN_WRAPPED_GNT } from '../../constants';

const initialState = fromJS({
  wrapperTokenPairs: [
    {
      unwrapped: TOKEN_ETHER,
      wrapper: TOKEN_WRAPPED_ETH
    },
    {
      unwrapped: TOKEN_GNOSIS,
      wrapper: TOKEN_WRAPPED_GNT
    }
  ]
});

const INIT = 'WRAP_UNWRAP/INIT';
const WRAP_ETH_TOKEN = 'WRAP_UNWRAP/WRAP_ETH_TOKEN';
const UNWRAP_ETH_TOKEN = 'WRAP_UNWRAP/UNWRAP_ETH_TOKEN';

const WRAP_GNT_TOKEN = 'WRAP_UNWRAP/WRAP_GNT_TOKEN';
const UNWRAP_GNT_TOKEN = 'WRAP_UNWRAP/UNWRAP_GNT_TOKEN';



const Init = createAction(INIT, () => null);


const WrapETHToken = createAction(WRAP_ETH_TOKEN, () => async (amount) => null);
const WrapETHTokenEpic = () => () => {};

const UnwrapETHToken = createAction(UNWRAP_ETH_TOKEN, () => async (amount) => null);
const UnwrapETHTokenEpic = () => () => {};


const WrapGNTToken = createAction(WRAP_GNT_TOKEN, () => async (amount) => null);
const WrapGNTTokenEpic = () => () => {};

const UnwrapGNTToken = createAction(UNWRAP_GNT_TOKEN, () => async (amount) => null);
const UnwrapGNTTokenEpic = () => () => {};


const actions = {};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
