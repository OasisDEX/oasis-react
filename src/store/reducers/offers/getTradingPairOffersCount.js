import {getMarketContractInstance, getTokenContractInstance} from '../../../bootstrap/contracts';
import {createAction} from 'redux-actions';

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