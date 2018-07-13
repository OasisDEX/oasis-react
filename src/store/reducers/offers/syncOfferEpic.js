import getOfferTradingPairAndType from "../../../utils/offers/getOfferTradingPairAndType";
import { OFFER_SYNC_TYPE_INITIAL, OFFER_SYNC_TYPE_UPDATE } from "../offers";
import { setOfferEpic } from "./setOfferEpic";
import { createAction } from "redux-actions";
import getTokenByAddress from "../../../utils/tokens/getTokenByAddress";
import { getMarketContractInstance } from "../../../bootstrap/contracts";
import { fulfilled, pending } from "../../../utils/store";
import { getTradingPairOfferCount } from './getTradingPairOffersCount';

const attemptToSyncRemovedOffer = createAction(
  "OFFERS/ATTEMPT_TO_SYNC_REMOVED_OFFER",
  syncOfferParams => syncOfferParams
);

export const loadOffer = createAction("OFFERS/LOAD_OFFER", async offerId =>
  getMarketContractInstance().offers(offerId)
);

export const  syncOffer = (
  offerId,
  syncType = OFFER_SYNC_TYPE_INITIAL,
  previousOfferState,
  {
    doLoadOffer = loadOffer,
    doSetOfferEpic = setOfferEpic,
    doGetTradingPairOfferCount = getTradingPairOfferCount
  } = {}
) => async (dispatch, getState) => {
  return dispatch(doLoadOffer(offerId)).then(
    ({ value: offer }) => {
      const [
        sellHowMuch,
        sellWhichTokenAddress,
        buyHowMuch,
        buyWhichTokenAddress,
        owner,
        timestamp
      ] = offer;

      const tokenAddressesAreValid =
        getTokenByAddress(buyWhichTokenAddress) &&
        getTokenByAddress(sellWhichTokenAddress);
      if (tokenAddressesAreValid) {
        const { baseToken, quoteToken, offerType } = getOfferTradingPairAndType(
          { buyWhichTokenAddress, sellWhichTokenAddress, syncType },
          getState()
        );
        const id = offerId.toString();
        dispatch(
          doGetTradingPairOfferCount(baseToken, quoteToken)
        );
        dispatch(
          doSetOfferEpic(
            Object.assign(
              {
                id,
                sellHowMuch,
                sellWhichTokenAddress,
                buyHowMuch,
                buyWhichTokenAddress,
                owner,
                timestamp,
                offerType,
                tradingPair: { baseToken, quoteToken },
                syncType: syncType
              },
              syncType == OFFER_SYNC_TYPE_UPDATE ? { previousOfferState } : {}
            )
          )
        );
        return {
          offer,
          offerMeta: { baseToken, quoteToken, offerType }
        };
      } else {
        dispatch(
          attemptToSyncRemovedOffer({ offerId, syncType, previousOfferState })
        );
        console.log(
          "trying to sync already removed offer",
          { offerId, syncType, previousOfferState },
          {
            sellHowMuch,
            sellWhichTokenAddress,
            buyHowMuch,
            buyWhichTokenAddress,
            owner,
            timestamp
          }
        );
      }
    }
  )
};

export const  syncRawOffer = (
  offer, { doSetOfferEpic = setOfferEpic } = {}
) => async (dispatch, getState) => {
      const {
        offerId,
        sellHowMuch,
        sellWhichTokenAddress,
        buyHowMuch,
        buyWhichTokenAddress,
        owner,
        timestamp
      } = offer;
        const { baseToken, quoteToken, offerType } = getOfferTradingPairAndType(
          { buyWhichTokenAddress, sellWhichTokenAddress, OFFER_SYNC_TYPE_INITIAL },
          getState()
        );
        const id = offerId.toString();
        dispatch(
          doSetOfferEpic({
            id,
            sellHowMuch,
            sellWhichTokenAddress,
            buyHowMuch,
            buyWhichTokenAddress,
            owner,
            timestamp,
            offerType,
            tradingPair: { baseToken, quoteToken },
            syncType: OFFER_SYNC_TYPE_INITIAL
          })
        );
        return {
          offer, offerMeta: { baseToken, quoteToken, offerType }
        };
};



export const reducer = {
  [pending(loadOffer)]: state => state,
  [fulfilled(loadOffer)]: state => state
};
