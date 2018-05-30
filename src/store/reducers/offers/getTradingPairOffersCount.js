import {getMarketContractInstance, getTokenContractInstance} from '../../../bootstrap/contracts';
import {createAction} from 'redux-actions';
import {Map} from 'immutable';
import {fulfilled} from '../../../utils/store';

export const getTradingPairOfferCount = createAction(
  'OFFERS/GET_TRADING_PAIR_OFFERS_COUNT',
  async (baseToken, quoteToken) => {
    const baseAddress = getTokenContractInstance(baseToken).address;
    const quoteAddress = getTokenContractInstance(quoteToken).address;
    return {
      baseToken, quoteToken,
      buyOfferCount: (await getMarketContractInstance().getOfferCount(quoteAddress, baseAddress)).toNumber(),
      sellOfferCount: (await getMarketContractInstance().getOfferCount(baseAddress, quoteAddress)).toNumber(),
    };
  },
);

export const reducer = {
  [fulfilled(getTradingPairOfferCount)]:
    (state, { payload: { baseToken, quoteToken, buyOfferCount, sellOfferCount } }) => {
      // console.log('getTradingPairOfferCount', baseToken, quoteToken);
      return state.updateIn(
        ['offers', Map({ baseToken, quoteToken })],
        tradingPairOffers => {
          return tradingPairOffers
            .updateIn(['buyOfferCount'], () => buyOfferCount)
            .updateIn(['sellOfferCount'], () => sellOfferCount);
        },
      );
    },
};
