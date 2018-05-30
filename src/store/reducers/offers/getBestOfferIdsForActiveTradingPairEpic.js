import {fromJS} from "immutable";
import {getBestOffer} from './syncOffersEpic';
import tokens from '../../selectors/tokens';
import {createAction} from 'redux-actions';

export const setActiveTradingPairBestOfferIds = createAction('OFFERS/SET_ACTIVE_TRADING_PAIR_BEST_OFFER_IDS',
  ({ bestBuyOfferId, bestSellOfferId }) => ({ bestBuyOfferId, bestSellOfferId })
);
export const getBestOfferIdsForActiveTradingPairEpic = () => async (dispatch, getState) => {
  const tradingPair = tokens.activeTradingPair(getState()) !== null
    ? fromJS(tokens.activeTradingPair(getState()))
    : tokens.defaultTradingPair(getState());
  const [baseToken, quoteToken] = [
    tradingPair.get("baseToken"),
    tradingPair.get("quoteToken")
  ];
  const bestBuyOfferId = (
    await
      dispatch(
        getBestOffer(quoteToken, baseToken,
        )
      )
  ).value;

  const bestSellOfferId = (
    await
      dispatch(
        getBestOffer(baseToken, quoteToken
        )
      )
  ).value;

  dispatch(
    setActiveTradingPairBestOfferIds({
      bestBuyOfferId: bestBuyOfferId.toString(), bestSellOfferId: bestSellOfferId.toString()
    })
  );
};

export const reducer = {
  [setActiveTradingPairBestOfferIds]:
    (state, {payload: { bestBuyOfferId, bestSellOfferId }}) =>
      state
        .setIn(['activeTradingPairBestOfferId', 'bestBuyOfferId'], bestBuyOfferId)
        .setIn(['activeTradingPairBestOfferId', 'bestSellOfferId'], bestSellOfferId),
};
