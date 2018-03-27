import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { TOKEN_ETHER, TOKEN_GNOSIS, TOKEN_WRAPPED_ETH, TOKEN_WRAPPED_GNT } from '../../constants';
import wrapUnwrap from '../selectors/wrapUnwrap';
import accounts from '../selectors/accounts';
import { fulfilled } from '../../utils/store';

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
  ],
  brokers: {
    [TOKEN_GNOSIS]: null
  }
});

const INIT = 'WRAP_UNWRAP/INIT';
const WRAP_ETH_TOKEN = 'WRAP_UNWRAP/WRAP_ETH_TOKEN';
const UNWRAP_ETH_TOKEN = 'WRAP_UNWRAP/UNWRAP_ETH_TOKEN';

const WRAP_GNT_TOKEN = 'WRAP_UNWRAP/WRAP_GNT_TOKEN';
const UNWRAP_GNT_TOKEN = 'WRAP_UNWRAP/UNWRAP_GNT_TOKEN';



const Init = createAction(INIT, () => null);


const transferToBroker = createAction('WRAP_UNWRAP/TRANSFER_TO_BROKER',
  (brokerAddress, gntAmount) => ({ gntAmount, brokerAddress })
);

const transferToBrokerEpic = () => (dispatch, getState) => {
  wrapUnwrap.getBrokerAddress(getState());
  dispatch(transferToBroker())
};

const loadGNTBrokerAddress = createAction(
  'WRAP_UNWRAP/LOAD_GNT_TOKEN_ADDRESS',
  (address) => new Promise((resolve, reject) =>
    window.contracts.WGNTNoProxy.getBroker.call(
      address,
      (e, address)=> { if (e)  { reject(e); } else { resolve(address) } }
    )
  )
);
const loadGNTBrokerAddressEpic = () => async (dispatch, getState) => (
    dispatch(
      loadGNTBrokerAddress(
        accounts.defaultAccount(getState())
      )
    )
  ).then(({ value }) => value);

const WrapETHToken = createAction(WRAP_ETH_TOKEN, () => async (amount) => null);
const WrapETHTokenEpic = () => () => {

};

const UnwrapETHToken = createAction(UNWRAP_ETH_TOKEN, () => async (amount) => null);
const UnwrapETHTokenEpic = () => () => {};


const WrapGNTToken = createAction(WRAP_GNT_TOKEN, () => async (amount) => null);
const WrapGNTTokenEpic = () => () => {

};

const UnwrapGNTToken = createAction(UNWRAP_GNT_TOKEN, () => async (amount) => null);
const UnwrapGNTTokenEpic = () => () => {};


const actions = {
  loadGNTBrokerAddressEpic
};

const reducer = handleActions({
  [fulfilled(loadGNTBrokerAddress)]: (state, { payload }) => state.setIn(['brokers', TOKEN_GNOSIS], payload)
}, initialState);

export default {
  actions,
  reducer,
};
