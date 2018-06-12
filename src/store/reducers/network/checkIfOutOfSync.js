import {
  getLatestBlock,
  setLatestBlockNumber
} from "./subscribeLatestBlockFilterEpic";
import { syncNetwork } from "../network";
import moment from "moment/moment";

export const NODE_OUT_OF_SYNC_THRESHOLD_IN_SECONDS = 640;

export const checkIfOutOfSyncEpic = () => dispatch =>
  dispatch(getLatestBlock()).then(({ value: lb }) => {
    const { timestamp, number } = lb;
    dispatch(setLatestBlockNumber(number));
    if (moment().diff(moment.unix(timestamp), "seconds") > NODE_OUT_OF_SYNC_THRESHOLD_IN_SECONDS) {
      dispatch(syncNetwork.pending(lb));
    } else {
      dispatch(syncNetwork.fulfilled(lb));
    }
  });
