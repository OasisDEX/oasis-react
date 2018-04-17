import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { reset, formValueSelector, change } from 'redux-form/immutable';

import {
ETH_UNIT_ETHER,
TOKEN_ETHER,
TOKEN_GOLEM,
TOKEN_WRAPPED_ETH,
TOKEN_WRAPPED_GNT,
} from '../../constants';
import wrapUnwrap from '../selectors/wrapUnwrap';
import accounts from '../selectors/accounts';
import { fulfilled } from '../../utils/store';
import getTokenContractInstance from '../../utils/contracts/getContractInstance';
import web3 from '../../bootstrap/web3';
import { DEFAULT_GAS_PRICE } from './transactions';
import { createPromiseActions } from '../../utils/createPromiseActions';
import balances from '../selectors/balances';



export const ADDRESS_HAS_NO_BROKER = 'ADDRESS_HAS_NO_BROKER';

const initialState = fromJS({
  wrapperTokenPairs: [
    {
      unwrapped: TOKEN_ETHER,
      wrapper: TOKEN_WRAPPED_ETH
    },
    {
      unwrapped: TOKEN_GOLEM,
      wrapper: TOKEN_WRAPPED_GNT
    }
  ],
  activeUnwrappedToken: TOKEN_ETHER,
  loadedBrokerContracts: [],
  brokerAddresses: {
    [TOKEN_GOLEM]: null
  },
  activeTokenWrapStatus: null,
  activeTokenUnwrapStatus: null,
});

const INIT = 'WRAP_UNWRAP/INIT';
const WRAP_ETHER = 'WRAP_UNWRAP/WRAP_ETHER';
const UNWRAP_ETHER = 'WRAP_UNWRAP/UNWRAP_ETHER';

const WRAP_GNT_TOKEN = 'WRAP_UNWRAP/WRAP_GNT_TOKEN';
const UNWRAP_GNT_TOKEN = 'WRAP_UNWRAP/UNWRAP_GNT_TOKEN';


export const TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_BROKER_APPROVAL = 'TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_BROKER_APPROVAL';
export const TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_PENDING = 'TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_PENDING';
export const TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_COMPLETE = 'TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_COMPLETE';
export const TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_WRAPPER_CONTRACT_APROVAL =
  'TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_WRAPPER_CONTRACT_APROVAL';
export const TOKEN_WRAP_STATUS_WRAP_COMPLETE = 'TOKEN_WRAP_STATUS_WRAP_COMPLETE';

export const TOKEN_UNWRAP_STATUS_AWAITING_UNWRAP_APPROVAL = 'TOKEN_UNWRAP_STATUS_AWAITING_UNWRAP_APPROVAL';
export const TOKEN_UNWRAP_STATUS_UNWRAP_PENDING = 'TOKEN_UNWRAP_STATUS_UNWRAP_PENDING';
export const TOKEN_UNWRAP_STATUS_UNWRAP_COMPLETE = 'TOKEN_UNWRAP_STATUS_UNWRAP_COMPLETE';


const getWrapAmount = (rootState) =>
  web3.toWei(formValueSelector('wrapToken')(rootState, 'amount'), ETH_UNIT_ETHER);

const getUnwrapAmount = (rootState) =>
  web3.toWei(formValueSelector('unwrapToken')(rootState,'amount'), ETH_UNIT_ETHER);

const init = createAction(INIT, () => null);


const setActiveWrapUnwrappedToken = createAction(
  'WRAP_UNWRAP/SET_ACTIVE_UNWRAPPED_TOKEN',
  token => token
);


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

const createGNTDepositBroker = createAction(
  'WRAP_UNWRAP/CREATE_DEPOSIT_BROKER',
  () => getTokenContractInstance(TOKEN_WRAPPED_GNT).createBroker()
);
const createDepositBrokerEpic = (tokenName) => (dispatch) => {
  switch (tokenName) {
    case TOKEN_GOLEM: {
      dispatch(createGNTDepositBroker());
    }break
  }
};

const wrapEther = createAction(
  WRAP_ETHER,
  ({ amountInWei }) =>
    getTokenContractInstance(TOKEN_WRAPPED_ETH).deposit({ value: amountInWei })
);

const wrapEther$ = createPromiseActions('WRAP_UNWRAP/WRAP_ETHER');
const wrapETHTokenEpic = () => (dispatch, getState) => {
  dispatch(wrapEther$.pending());
  const wrapAmount = getWrapAmount(getState());
  dispatch(
    wrapEther({ amountInWei: wrapAmount })
  );
  dispatch(wrapEther$.fulfilled());
  dispatch(resetActiveWrapForm());
};


const unwrapEther = createAction(
  UNWRAP_ETHER,
  async (amountInWei, gas) =>
    getTokenContractInstance(TOKEN_WRAPPED_ETH).withdraw(amountInWei, { gas: gas })
);

const unwrapEther$ = createPromiseActions('WRAP_UNWRAP/UNWRAP_ETHER');
const unwrapEtherEpic = () => (dispatch, getState) => {
  dispatch(unwrapEther$.pending());
  dispatch(
    unwrapEther(getUnwrapAmount(getState()))
  );
  dispatch(unwrapEther$.fulfilled());
  dispatch(resetActiveUnwrapForm());
};


const wrapGNTToken = createAction(
  WRAP_GNT_TOKEN,
  async ({ brokerAddress, amountInWei }) =>
    getTokenContractInstance(TOKEN_GOLEM).transfer(brokerAddress, amountInWei)
);


const wrapGNTToken$ = createPromiseActions('WRAP_UNWRAP/WRAP_GNT_TOKEN');
const wrapGNTTokenEpic = () => async (dispatch, getState) => {
  dispatch(wrapGNTToken$.pending());
  const depositBrokerAddress = wrapUnwrap.getBrokerAddress(getState(), TOKEN_GOLEM);
  const wrapAmount = getWrapAmount(getState());
  if (!wrapUnwrap.isTokenBrokerInitiallyLoaded(getState(), TOKEN_GOLEM)) {
    await dispatch(loadGNTBrokerAddressEpic());
  }

  if (wrapUnwrap.hasTokenBroker(getState(), TOKEN_GOLEM)) {
    await dispatch(
      wrapGNTToken({ brokerAddress: depositBrokerAddress, amountInWei: wrapAmount })
    );
    await dispatch(
      loadDepositBrokerContractEpic(TOKEN_GOLEM)
    );
    dispatch(clearDepositBrokerEpic(TOKEN_GOLEM));

  } else {
    await dispatch(createDepositBrokerEpic(TOKEN_GOLEM));
    await dispatch(
      loadDepositBrokerContractEpic(TOKEN_GOLEM)
    );

    await dispatch(
      wrapGNTToken({ brokerAddress: depositBrokerAddress, amountInWei: wrapAmount })
    );

    dispatch(clearDepositBrokerEpic(TOKEN_GOLEM));
  }

  dispatch(wrapGNTToken$.fulfilled());
  dispatch(resetActiveWrapForm());
};

const addressHasNoBrokerForToken = createAction(
  'WRAP_UNWRAP/ADDRESS_HAS_NO_BROKER_FOR_TOKEN',
  tokenName => tokenName

);

const loadDepositBrokerContractEpic = (tokenName = TOKEN_GOLEM) => (dispatch, getState) => {
  const depositBrokerAddress = wrapUnwrap.getBrokerAddress(getState(), TOKEN_GOLEM);
  if (!web3.isAddress(depositBrokerAddress)) {
    dispatch(
      addressHasNoBrokerForToken(tokenName)
    );
  } else {
    window.contracts.initDepositBrokerContract(tokenName, depositBrokerAddress);
  }
};

const clearDepositBroker = createAction(
  'WRAP_UNWRAP/CLEAR_DEPOSIT_BROKER',
  tokenName => window.contracts.getDepositBrokerContractInstance(tokenName).clear()
);

const clearDepositBrokerEpic = (tokenName) => (dispatch) => {
  dispatch(clearDepositBroker(tokenName));
};


const unwrapGNTToken = createAction(
  UNWRAP_GNT_TOKEN,
  async ({ gas, amountInWei }) =>
    getTokenContractInstance(TOKEN_WRAPPED_GNT).withdraw(amountInWei, { gas: gas|| DEFAULT_GAS_PRICE })
);

const unwrapGNTToken$ = createPromiseActions('WRAP_UNWRAP/UNWRAP_GNT_TOKEN');
const unwrapGNTTokenEpic = () => (dispatch, getState) => {
  dispatch(unwrapGNTToken$.pending());
  dispatch(
    unwrapGNTToken({ amountInWei: getUnwrapAmount(getState()) })
  );
  dispatch(unwrapGNTToken$.fulfilled());
  dispatch(resetActiveUnwrapForm());
};



const wrapTokenEpic = () => (dispatch, getState) => {
  switch (wrapUnwrap.activeUnwrappedToken(getState())) {
    case TOKEN_ETHER : {
      dispatch(wrapETHTokenEpic());
    } break;
    case TOKEN_GOLEM : {
      dispatch(wrapGNTTokenEpic());
    } break;
  }
};


const unwrapTokenEpic = () => (dispatch, getState) => {
  switch (wrapUnwrap.activeUnwrappedToken(getState())) {
    case TOKEN_ETHER : {
      dispatch(unwrapEtherEpic());
    } break;
    case TOKEN_GOLEM : {
      dispatch(unwrapGNTTokenEpic());
    } break;
  }
};


const setWrapMax = () => (dispatch, getState) => {
  const activeUnwrappedToken = wrapUnwrap.activeUnwrappedToken(getState());
  const maxWrapValueInEther = activeUnwrappedToken === TOKEN_ETHER ?
    web3.fromWei(balances.ethBalance(getState())) : balances.tokenBalance(getState(), { tokenName: activeUnwrappedToken });
  if (maxWrapValueInEther) {
    dispatch(
      change('wrapToken', 'amount', maxWrapValueInEther)
    );
  }
};

const setUnwrapMax = () => (dispatch, getState) => {
  const activeWrappedToken = wrapUnwrap.activeWrappedToken(getState());
  const maxUnwrapValueInEther = activeWrappedToken === TOKEN_ETHER ?
    web3.fromWei(balances.ethBalance(getState())) : balances.tokenBalance(getState(), { tokenName: activeWrappedToken });
  if (maxUnwrapValueInEther) {
    dispatch(
      change('unwrapToken', 'amount', maxUnwrapValueInEther)
    );
  }

};

const resetActiveWrapForm = createAction('WRAP_UNWRAP/SET_WRAP_FORM', () => reset('wrapToken'));

const setActiveUnwrapStatus = createAction('WRAP_UNWRAP/SET_UNWRAP_STATUS', status => status);
const resetActiveUnwrapStatus = createAction('WRAP_UNWRAP/SET_UNWRAP_STATUS');

const setActiveWrapStatus = createAction('WRAP_UNWRAP/SET_WRAP_STATUS', status => status);
const resetActiveWrapStatus = createAction('WRAP_UNWRAP/SET_WRAP_STATUS');


const resetActiveUnwrapForm = createAction('WRAP_UNWRAP/SET_UNWRAP_FORM', () => reset('unwrapToken'));

const actions = {
  init,
  loadGNTBrokerAddressEpic,
  wrapTokenEpic,
  unwrapTokenEpic,
  setActiveWrapUnwrappedToken,
  setWrapMax,
  setUnwrapMax
};

const reducer = handleActions({
  [fulfilled(loadGNTBrokerAddress)]: (state, { payload }) => state.setIn(['brokerAddresses', TOKEN_GOLEM], payload),
  [setActiveWrapUnwrappedToken]: (state, { payload }) => {
    return state.set('activeUnwrappedToken', payload);
  },
  [setActiveWrapStatus]: (state, payload) => state.set('activeWrapStatus', payload),
  [resetActiveWrapStatus]: state => state.set('activeWrapStatus', null),
  [setActiveUnwrapStatus]: (state, payload) => state.set('activeUnwrapStatus', payload),
  [resetActiveUnwrapStatus]: state => state.set('activeUnwrapStatus', null),
  [addressHasNoBrokerForToken]: (state, payload) => state.setIn(['brokerAddresses', payload], ADDRESS_HAS_NO_BROKER)
}, initialState);

export default {
  actions,
  reducer,
};
