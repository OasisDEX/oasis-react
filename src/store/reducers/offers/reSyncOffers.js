import { createPromiseActions } from "../../../utils/createPromiseActions";
import { syncOffer } from "./syncOfferEpic";
import { Map } from "immutable";
import { SYNC_STATUS_COMPLETED, SYNC_STATUS_PENDING } from "../../../constants";
import offers from "../../selectors/offers";
import { getMarketContractInstance } from "../../../bootstrap/contracts";

export const reSyncOffers = createPromiseActions(
  "RE_SYNC_OFFERS/RE_SYNC_OFFERS"
);
export const reSyncOffersEpic = tradingPair => async (dispatch, getState) => {
  try {
    const tradingPairOffersData = offers.tradingPairOffersData(
      getState(),
      tradingPair
    );
    dispatch(reSyncOffers.pending());
    const syncStartBlockNumber = tradingPairOffersData.getIn([
        "initialSyncMeta",
        "syncStartBlockNumber"
      ]),
      syncEndBlockNumber = tradingPairOffersData.getIn([
        "initialSyncMeta",
        "syncEndBlockNumber"
      ]);
    getMarketContractInstance()
      .LogItemUpdate(
        {},
        {
          fromBlock: syncStartBlockNumber,
          toBlock: syncEndBlockNumber
        }
      )
      .get((err, logUpdateList) => {
        if (!err) {
          logUpdateList.forEach(({ args: { id } }) =>
            dispatch(syncOffer(id.toString()))
          );
        }
      });
  } catch (e) {
    dispatch(reSyncOffers.rejected(e));
  }
};

const addOfferToReSyncSet = createPromiseActions("RE_SYNC");

export const reSyncOffersReducer = {
  [addOfferToReSyncSet]: state => state,
  [reSyncOffers.pending]: (state, { payload }) =>
    state.setIn(
      ["offers", Map(payload), "loadingBuyOffers"],
      SYNC_STATUS_PENDING
    ),
  [reSyncOffers.fulfilled]: (state, { payload }) =>
    state.setIn(
      ["offers", Map(payload), "loadingBuyOffers"],
      SYNC_STATUS_COMPLETED
    ),
  [reSyncOffers.rejected]: (state, { payload }) => {
    throw payload;
  }
};
