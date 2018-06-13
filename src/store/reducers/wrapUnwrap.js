import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import { reset, formValueSelector, change } from "redux-form/immutable";

import {
  DEFAULT_GAS_LIMIT,
  DEFAULT_GAS_PRICE,
  ETH_UNIT_ETHER,
  TOKEN_ETHER,
  TOKEN_GOLEM,
  TOKEN_WRAPPED_ETH,
  TOKEN_WRAPPED_GNT
} from "../../constants";
import wrapUnwrap from "../selectors/wrapUnwrap";
import accounts from "../selectors/accounts";
import { fulfilled } from "../../utils/store";
import web3 from "../../bootstrap/web3";
import { TX_UNWRAP, TX_WRAP } from "./transactions";
import { createPromiseActions } from "../../utils/createPromiseActions";
import balances from "../selectors/balances";
import { handleTransaction } from "../../utils/transactions/handleTransaction";
import {
  getDepositBrokerContractInstance,
  getTokenContractInstance,
  getTokenNoProxyContractInstance,
  initDepositBrokerContract
} from "../../bootstrap/contracts";

export const WRAP_UNWRAP_CREATE_DEPOSIT_BROKER =
  "WRAP_UNWRAP/CREATE_DEPOSIT_BROKER";
export const WRAP_UNWRAP_CLEAR_DEPOSIT_BROKER =
  "WRAP_UNWRAP/CLEAR_DEPOSIT_BROKER";

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
  brokerAddresses: {},
  activeTokenWrapStatus: null,
  activeTokenUnwrapStatus: null
});

const WRAP_ETHER = "WRAP_UNWRAP/WRAP_ETHER";
const UNWRAP_ETHER = "WRAP_UNWRAP/UNWRAP_ETHER";
export const WRAP_TOKEN_WRAPPER_NEXT_TRANSACTION_DELAY_MS = 3000;

const WRAP_GNT_TOKEN = "WRAP_UNWRAP/WRAP_GNT_TOKEN";
const UNWRAP_GNT_TOKEN = "WRAP_UNWRAP/UNWRAP_GNT_TOKEN";

export const TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_BROKER_APPROVAL =
  "TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_BROKER_APPROVAL";
export const TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_PENDING =
  "TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_PENDING";
export const TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_COMPLETE =
  "TOKEN_WRAP_STATUS_TRANSFER_TO_BROKER_COMPLETE";
export const TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_WRAPPER_CONTRACT_APROVAL =
  "TOKEN_WRAP_STATUS_AWAITING_TRANSFER_TO_WRAPPER_CONTRACT_APROVAL";
export const TOKEN_WRAP_STATUS_WRAP_COMPLETE =
  "TOKEN_WRAP_STATUS_WRAP_COMPLETE";

export const TOKEN_UNWRAP_STATUS_AWAITING_UNWRAP_APPROVAL =
  "TOKEN_UNWRAP_STATUS_AWAITING_UNWRAP_APPROVAL";
export const TOKEN_UNWRAP_STATUS_UNWRAP_PENDING =
  "TOKEN_UNWRAP_STATUS_UNWRAP_PENDING";
export const TOKEN_UNWRAP_STATUS_UNWRAP_COMPLETE =
  "TOKEN_UNWRAP_STATUS_UNWRAP_COMPLETE";

const getWrapAmount = rootState =>
  web3.toWei(
    formValueSelector("wrapToken")(rootState, "amount"),
    ETH_UNIT_ETHER
  );

const getUnwrapAmount = rootState =>
  web3.toWei(
    formValueSelector("unwrapToken")(rootState, "amount"),
    ETH_UNIT_ETHER
  );

const setActiveWrapUnwrappedToken = createAction(
  "WRAP_UNWRAP/SET_ACTIVE_UNWRAPPED_TOKEN",
  token => token
);

const loadGNTBrokerAddress = createAction(
  "WRAP_UNWRAP/LOAD_GNT_TOKEN_ADDRESS",
  address =>
    new Promise((resolve, reject) =>
      getTokenNoProxyContractInstance(TOKEN_WRAPPED_GNT).getBroker.call(
        address,
        (e, address) => {
          if (e) {
            reject(e);
          } else {
            resolve(address);
          }
        }
      )
    ),
  address => address
);
const loadGNTBrokerAddressEpic = () => async (dispatch, getState) =>
  dispatch(loadGNTBrokerAddress(accounts.defaultAccount(getState()))).then(
    ({ value }) => value
  );

const createGNTDepositBroker = createAction(
  "WRAP_UNWRAP/CREATE_DEPOSIT_BROKER",
  ({ gasLimit = DEFAULT_GAS_LIMIT, gasPrice = DEFAULT_GAS_PRICE }) =>
    getTokenContractInstance(TOKEN_WRAPPED_GNT).createBroker({
      gas: gasLimit,
      gasPrice
    })
);
const createDepositBrokerEpic = (
  tokenName,
  withCallbacks,
  nextTransaction,
  {
    doAddTransactionEpic = null,
    doCreateGNTDepositBroker = createGNTDepositBroker,
    nextTransactionDelay = WRAP_TOKEN_WRAPPER_NEXT_TRANSACTION_DELAY_MS
  } = {}
) => dispatch => {
  switch (tokenName) {
    case TOKEN_GOLEM:
      return handleTransaction(
        {
          dispatch,
          callsNext: true,
          transactionDispatcher: () => dispatch(doCreateGNTDepositBroker()),
          transactionType: TX_WRAP,
          txMeta: {
            txSubType: WRAP_UNWRAP_CREATE_DEPOSIT_BROKER
          },
          withCallbacks,
          onCallNextTransaction: nextTransaction,
          nextTransactionDelay
        },
        doAddTransactionEpic ? { addTransactionEpic: doAddTransactionEpic } : {}
      );
  }
};

const wrapEther = createAction(
  WRAP_ETHER,
  ({
    amountInWei,
    gasLimit = DEFAULT_GAS_LIMIT,
    gasPrice = DEFAULT_GAS_PRICE
  }) =>
    getTokenContractInstance(TOKEN_WRAPPED_ETH).deposit(
      { value: amountInWei, gas: gasLimit, gasPrice }
    )
);

const wrapEther$ = createPromiseActions("WRAP_UNWRAP/WRAP_ETHER");
const wrapETHTokenEpic = (
  withCallbacks,
  { doWrapEther = wrapEther, doAddTransactionEpic = null } = {}
) => (dispatch, getState) => {
  dispatch(wrapEther$.pending());
  const wrapAmount = getWrapAmount(getState());
  return handleTransaction(
    {
      dispatch,
      transactionDispatcher: () =>
        dispatch(doWrapEther({ amountInWei: wrapAmount })),
      transactionType: TX_WRAP,
      withCallbacks
    },
    doAddTransactionEpic ? { addTransactionEpic: doAddTransactionEpic } : {}
  );
};

const unwrapEther = createAction(
  UNWRAP_ETHER,
  async (
    amountInWei,
    { gasLimit = DEFAULT_GAS_LIMIT, gasPrice = DEFAULT_GAS_LIMIT }
  ) =>
    getTokenContractInstance(TOKEN_WRAPPED_ETH).withdraw(amountInWei, {
      gas: gasLimit,
      gasPrice
    })
);

const unwrapEther$ = createPromiseActions("WRAP_UNWRAP/UNWRAP_ETHER");
const unwrapEtherEpic = (
  withCallbacks,
  { doUnwrapEther = unwrapEther, doAddTransactionEpic = null } = {}
) => (dispatch, getState) => {
  dispatch(unwrapEther$.pending());
  return handleTransaction(
    {
      dispatch,
      transactionDispatcher: () =>
        dispatch(doUnwrapEther(getUnwrapAmount(getState()))),
      transactionType: TX_UNWRAP,
      withCallbacks
    },
    doAddTransactionEpic ? { addTransactionEpic: doAddTransactionEpic } : {}
  );
};

const wrapGNTTokenAction = createAction(
  WRAP_GNT_TOKEN,
  async ({
    brokerAddress,
    amountInWei,
    gasLimit = DEFAULT_GAS_LIMIT,
    gasPrice = DEFAULT_GAS_PRICE
  }) =>
    getTokenContractInstance(TOKEN_GOLEM).transfer(brokerAddress, amountInWei, {
      gas: gasLimit,
      gasPrice
    })
);

const wrapGNTToken = (
  { brokerAddress, amountInWei },
  withCallbacks,
  nextTransaction,
  {
    doWrapGNTTokenAction = wrapGNTTokenAction,
    doAddTransactionEpic = null,
    nextTransactionDelay = 3000
  } = {}
) => dispatch => {
  return handleTransaction(
    {
      dispatch,
      callsNext: true,
      transactionDispatcher: () =>
        dispatch(doWrapGNTTokenAction({ brokerAddress, amountInWei })),
      transactionType: TX_WRAP,
      withCallbacks,
      txMeta: {
        txSubType: "wrapGNT"
      },
      onCallNextTransaction: nextTransaction,
      nextTransactionDelay
    },
    doAddTransactionEpic ? { addTransactionEpic: doAddTransactionEpic } : {}
  );
};

const wrapGNTToken$ = createPromiseActions("WRAP_UNWRAP/WRAP_GNT_TOKEN");
const wrapGNTTokenEpic = (
  withCallbacks,
  {
    doWrapGNTTokenAction = null,
    doAddTransactionEpic = null,
    doCreateGNTDepositBroker = null,
    nextTransactionDelay = null,
    doLoadDepositBrokerContractEpic = loadDepositBrokerContractEpic,
    doClearDepositBrokerEpic = clearDepositBrokerEpic,
    doLoadGNTBrokerAddressEpic = loadGNTBrokerAddressEpic,
    nestedDispatch = (...args) => args[0](...args.slice(1))
  } = {}
) => async (dispatch, getState) => {
  dispatch(wrapGNTToken$.pending());
  const depositBrokerAddress = wrapUnwrap.getBrokerAddress(
    getState(),
    TOKEN_GOLEM
  );
  const wrapAmount = getWrapAmount(getState());
  if (!wrapUnwrap.isTokenBrokerInitiallyLoaded(getState(), TOKEN_GOLEM)) {
    await dispatch(loadGNTBrokerAddressEpic());
  }

  if (wrapUnwrap.hasTokenBroker(getState(), TOKEN_GOLEM)) {
    return dispatch(
      wrapGNTToken(
        { brokerAddress: depositBrokerAddress, amountInWei: wrapAmount },
        withCallbacks,
        async () => {
          await dispatch(doLoadDepositBrokerContractEpic(TOKEN_GOLEM));
          dispatch(doClearDepositBrokerEpic(TOKEN_GOLEM, withCallbacks));
        },
        Object.assign(
          {},
          doAddTransactionEpic ? { doAddTransactionEpic } : {},
          doWrapGNTTokenAction ? { doWrapGNTTokenAction } : {},
          nextTransactionDelay != null ? { nextTransactionDelay } : {}
        )
      )
    );
  } else {
    return dispatch(
      createDepositBrokerEpic(
        TOKEN_GOLEM,
        withCallbacks,
        async () => {
          await dispatch(doLoadGNTBrokerAddressEpic());
          await dispatch(doLoadDepositBrokerContractEpic(TOKEN_GOLEM));
          testActions.lastNestedWrapGNT = nestedDispatch(
            dispatch,
            wrapGNTToken(
              { brokerAddress: depositBrokerAddress, amountInWei: wrapAmount },
              withCallbacks,
              async () => {
                await dispatch(
                  doClearDepositBrokerEpic(TOKEN_GOLEM, withCallbacks)
                );
                dispatch(wrapGNTToken$.fulfilled());
                dispatch(resetActiveWrapForm());
              },
              Object.assign(
                {},
                doAddTransactionEpic ? { doAddTransactionEpic } : {},
                doWrapGNTTokenAction ? { doWrapGNTTokenAction } : {},
                nextTransactionDelay != null ? { nextTransactionDelay } : {}
              )
            )
          );
        },
        Object.assign(
          {},
          doAddTransactionEpic ? { doAddTransactionEpic } : {},
          doCreateGNTDepositBroker ? { doCreateGNTDepositBroker } : {},
          nextTransactionDelay != null ? { nextTransactionDelay } : {}
        )
      )
    );
  }
};

const addressHasNoBrokerForToken = createAction(
  "WRAP_UNWRAP/ADDRESS_HAS_NO_BROKER_FOR_TOKEN",
  tokenName => tokenName
);

const loadDepositBrokerContractEpic = (tokenName = TOKEN_GOLEM) => (
  dispatch,
  getState
) => {
  const depositBrokerAddress = wrapUnwrap.getBrokerAddress(
    getState(),
    TOKEN_GOLEM
  );
  if (web3.toBigNumber(depositBrokerAddress).eq(0)) {
    dispatch(addressHasNoBrokerForToken(tokenName));
  } else {
    initDepositBrokerContract(tokenName, depositBrokerAddress);
  }
};

const clearDepositBroker = createAction(
  "WRAP_UNWRAP/CLEAR_DEPOSIT_BROKER",
  (tokenName, { gasPrice = DEFAULT_GAS_PRICE, gasLimit = DEFAULT_GAS_LIMIT }) =>
    getDepositBrokerContractInstance(tokenName).clear({
      gas: gasLimit,
      gasPrice
    })
);

const clearDepositBrokerEpic = (tokenName, withCallbacks) => dispatch => {
  return handleTransaction({
    dispatch,
    transactionDispatcher: () => dispatch(clearDepositBroker(tokenName)),
    transactionType: TX_WRAP,
    txMeta: {
      txSubType: WRAP_UNWRAP_CLEAR_DEPOSIT_BROKER,
      tokenName
    },
    withCallbacks
  });
};

const unwrapGNTToken = createAction(
  UNWRAP_GNT_TOKEN,
  async ({
    gasLimit = DEFAULT_GAS_LIMIT,
    gasPrice = DEFAULT_GAS_PRICE,
    amountInWei
  }) =>
    getTokenContractInstance(TOKEN_WRAPPED_GNT).withdraw(amountInWei, {
      gas: gasLimit,
      gasPrice
    })
);

const unwrapGNTToken$ = createPromiseActions("WRAP_UNWRAP/UNWRAP_GNT_TOKEN");
const unwrapGNTTokenEpic = (
  withCallbacks,
  { doUnwrapGNTToken = unwrapGNTToken, doAddTransactionEpic = null } = {}
) => (dispatch, getState) => {
  dispatch(unwrapGNTToken$.pending());
  return handleTransaction(
    {
      dispatch,
      transactionDispatcher: () =>
        dispatch(
          doUnwrapGNTToken({ amountInWei: getUnwrapAmount(getState()) })
        ),
      transactionType: TX_UNWRAP,
      withCallbacks
    },
    doAddTransactionEpic ? { addTransactionEpic: doAddTransactionEpic } : {}
  );
};

const wrapTokenEpic = withCallbacks => (dispatch, getState) => {
  switch (wrapUnwrap.activeUnwrappedToken(getState())) {
    case TOKEN_ETHER:
      {
        dispatch(wrapETHTokenEpic(withCallbacks));
      }
      break;
    case TOKEN_GOLEM:
      {
        dispatch(wrapGNTTokenEpic(withCallbacks));
      }
      break;
  }
};

const unwrapTokenEpic = withCallbacks => (dispatch, getState) => {
  switch (wrapUnwrap.activeUnwrappedToken(getState())) {
    case TOKEN_ETHER:
      {
        dispatch(unwrapEtherEpic(withCallbacks));
      }
      break;
    case TOKEN_GOLEM:
      {
        dispatch(unwrapGNTTokenEpic(withCallbacks));
      }
      break;
  }
};

const setWrapMax = () => (dispatch, getState) => {
  const activeUnwrappedToken = wrapUnwrap.activeUnwrappedToken(getState());
  const maxWrapValueInEther =
    activeUnwrappedToken === TOKEN_ETHER
      ? web3.fromWei(balances.ethBalance(getState()))
      : balances.tokenBalance(getState(), { tokenName: activeUnwrappedToken });
  if (maxWrapValueInEther) {
    dispatch(change("wrapToken", "amount", maxWrapValueInEther.toString()));
  }
};

const setUnwrapMax = () => (dispatch, getState) => {
  const activeWrappedToken = wrapUnwrap.activeWrappedToken(getState());
  const maxUnwrapValueInEther =
    activeWrappedToken === TOKEN_ETHER
      ? web3.fromWei(balances.ethBalance(getState()))
      : balances.tokenBalance(getState(), { tokenName: activeWrappedToken });
  if (maxUnwrapValueInEther) {
    dispatch(change("unwrapToken", "amount", maxUnwrapValueInEther.toString()));
  }
};

const resetActiveWrapForm = () => reset("wrapToken");

const setActiveUnwrapStatus = createAction(
  "WRAP_UNWRAP/SET_UNWRAP_STATUS",
  status => status
);
const resetActiveUnwrapStatus = createAction("WRAP_UNWRAP/SET_UNWRAP_STATUS");

const setActiveWrapStatus = createAction(
  "WRAP_UNWRAP/SET_WRAP_STATUS",
  status => status
);
const resetActiveWrapStatus = createAction("WRAP_UNWRAP/SET_WRAP_STATUS");

const resetActiveUnwrapForm = () => reset("unwrapToken");

const actions = {
  loadGNTBrokerAddressEpic,
  wrapTokenEpic,
  unwrapTokenEpic,
  setActiveWrapUnwrappedToken,
  setWrapMax,
  setUnwrapMax,
  resetActiveWrapForm,
  resetActiveUnwrapForm
};

const testActions = {
  wrapETHTokenEpic,
  unwrapEtherEpic,
  wrapGNTTokenEpic,
  unwrapGNTTokenEpic,
  lastNestedWrapGNT: null
};

const reducer = handleActions(
  {
    [fulfilled(loadGNTBrokerAddress)]: (state, action) =>
      state.setIn(
        ["brokerAddresses", action.meta, TOKEN_GOLEM],
        action.payload
      ),
    [setActiveWrapUnwrappedToken]: (state, { payload }) => {
      return state.set("activeUnwrappedToken", payload);
    },
    [setActiveWrapStatus]: (state, payload) =>
      state.set("activeWrapStatus", payload),
    [resetActiveWrapStatus]: state => state.set("activeWrapStatus", null),
    [setActiveUnwrapStatus]: (state, payload) =>
      state.set("activeUnwrapStatus", payload),
    [resetActiveUnwrapStatus]: state => state.set("activeUnwrapStatus", null)
  },
  initialState
);

export default {
  actions,
  testActions,
  reducer
};
