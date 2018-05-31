/* eslint-disable no-unused-vars */
import { createAction, handleActions } from "redux-actions";
import { fromJS } from "immutable";
import { find } from "lodash";
import { createPromiseActions } from "../../utils/createPromiseActions";
import { fulfilled } from "../../utils/store";

import {
  CLOSED,
  CONNECTING,
  LIVE_NET_ID,
  ONLINE,
  OUT_OF_SYNC
} from "../../constants";

import {
  fetchEthereumPrice,
  getBlock,
  getLatestBlock,
  getLatestBlockNumber
} from "./network/subscribeLatestBlockFilterEpic";
import { checkNetworkInitialEpic } from "./network/checkNetworkInitialEpic";
import {
  checkNetworkEpic,
  getConnectedNetworkId
} from "./network/checkNetworkEpic";
import { CheckNetworkAction } from "./network/CheckNetworkAction";
import {
  setLastNetworkCheckStartAt,
  setLastNetworkCheckEndAt
} from "./network/onNetworkCheckEndEpic";

const initialState = fromJS({
  status: CLOSED,
  sync: { isPending: false, ts: null },
  activeNetworkName: null,
  activeNetworkId: null,
  latestBlockNumber: null,
  outOfSync: null,
  latestEthereumPrice: null,
  isNetworkCheckPending: null,
  lastNetworkCheckAt: { start: null, end: null },
  latestBlockReceivedAt: null,
  noProviderConnected: true
});

const syncNetwork = createPromiseActions("NETWORK/SYNC_NETWORK");
const connected = createAction("NETWORK/CONNECTED");
const connecting = createAction("NETWORK/CONNECTING");
const disconnected = createAction("NETWORK/DISCONNECTED");

const setNoProviderConnected = createAction("NETWORK/NO_PROVIDER_CONNECTED");


const actions = {
  connected,
  connecting,
  disconnected,
  checkNetworkInitialEpic,
  checkNetworkEpic,
  getBlock,
  getLatestBlock,
  getLatestBlockNumber,
  getConnectedNetworkId,
  fetchEthereumPrice,
  setNoProviderConnected,
};

const reducer = handleActions(
  {
    [setNoProviderConnected]: (state, { payload }) => state.set("noProviderConnected", payload),
    [setLastNetworkCheckStartAt]: (state, { payload }) =>
      state.setIn(["lastNetworkCheckAt", "start"], payload),
    [setLastNetworkCheckEndAt]: (state, { payload }) =>
      state.setIn(["lastNetworkCheckAt", "end"], payload),
    [CheckNetworkAction.pending]: state =>
      state.set("isNetworkCheckPending", true),
    [CheckNetworkAction.fulfilled]: state =>
      state.set("isNetworkCheckPending", false),
    [CheckNetworkAction.rejected]: state =>
      state.set("isNetworkCheckPending", false),
    [connected]: state =>
      state
        .set("status", ONLINE)
        .set("isConnecting", false)
        .set("connected", true),
    [connecting]: state =>
      state.set("isConnecting", true).set("status", CONNECTING),
    [disconnected]: state =>
      state
        .set("status", CLOSED)
        .set("isConnecting", false)
        .set("connected", false),
    [syncNetwork.pending]: state =>
      state.setIn(["sync", "isPending"], true).set("status", OUT_OF_SYNC),
    [syncNetwork.fulfilled]: state =>
      state.setIn(["sync", "isPending"], ONLINE),
    [fulfilled(getConnectedNetworkId)]: (state, { payload }) =>
      state.update(
        "activeNetworkId",
        nid => (!!payload && nid === payload ? nid : payload)
      ),
    [fulfilled(getLatestBlockNumber)]: (
      state,
      { payload: { latestBlockNumber, latestBlockReceivedAt } }
    ) =>
      state
        .update("latestBlockNumber", () => latestBlockNumber)
        .set("latestBlockReceivedAt", latestBlockReceivedAt),
    [fulfilled(fetchEthereumPrice)]: (state, { payload }) =>
      state.set("latestEthereumPrice", payload[0])
  },
  initialState
);

export default {
  actions,
  reducer
};
