import { createAction, handleActions } from 'redux-actions';
import Immutable from 'immutable';

const initialState = Immutable.fromJS({
  limitsLoaded: false,

  ETHDepositProgress: null,
  ETHWithdrawProgress: null,

  GNTDepositProgress: null,
  GNTWithdrawProgress: null,
});

const INIT = 'WRAP_UNWRAP/INIT';
const WRAP_TOKEN = 'WRAP_UNWRAP/WRAP_TOKEN';
const UNWRAP_TOKEN = 'WRAP_UNWRAP/UNWRAP_TOKEN';


const STATUS_SIGNING = 'WRAP_UNWRAP/STATUS_SIGNING';
const STATUS_AWAITING_CONFIRMATION = 'WRAP_UNWRAP/AWAITING_CONFIRMATION';
const STATUS_CONFIRMED = 'WRAP_UNWRAP/STATUS_CONFIRMED';

// ETHDepositProgress: 0,
//   ETHDepositProgressMessage: '',
//   ETHDepositErrorMessage: '',

// ETHWithdrawProgress: 0,
//   ETHWithdrawProgressMessage: '',
//   ETHWithdrawErrorMessage: '',

// GNTDepositProgress: 0,
//   GNTDepositProgressMessage: '',
//   GNTDepositErrorMessage: '',
//   GNTWithdrawProgress: 0,
//   GNTWithdrawProgressMessage: '',
//   GNTWithdrawErrorMessage: '',

const Init = createAction(
  INIT,
  () => null,
);

/**
 *
 */
const WrapToken = createAction(
  WRAP_TOKEN,
  () => async (token, amount) => null,
);

const UnwrapToken = createAction(
  UNWRAP_TOKEN,
  () => async (token, amount) => null,
);

const actions = {
  Init,
  WrapToken,
  UnwrapToken,
};

const reducer = handleActions({}, initialState);

export default {
  actions,
  reducer,
};
