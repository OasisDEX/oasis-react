import { createSelector } from 'reselect';
import { formValueSelector } from 'redux-form/immutable';
import balances from './balances';
import BigNumber from 'bignumber.js';
import transactions from './transactions';
import markets from './markets';

const offerTakes = s => s.get('offerTakes');

const activeOfferTake = createSelector(
  offerTakes, s => s.get('activeOfferTake')
);

const activeOfferTakeType = createSelector(
  offerTakes, s => s.get('activeOfferTakeType')
);

const activeOfferTakeOfferData = createSelector(
  offerTakes, s => s.getIn(['activeOfferTake', 'offerData'])
);

const activeOfferTakeOfferOwner = createSelector(
  offerTakes, s => s.getIn(['activeOfferTake', 'offerData', 'owner'])
);

const activeOfferTakeBuyToken = createSelector(
  offerTakes, s => s.getIn(['activeOfferTake', 'buyToken'])
);

const activeOfferTakeSellToken = createSelector(
  offerTakes, s => s.getIn(['activeOfferTake', 'sellToken'])
);

const isOfferTakeModalOpen = createSelector(
  offerTakes, s => s.get('isOfferTakeModalOpen')
);
const activeOfferTakeOfferId = createSelector(
  offerTakes, s => s.get('activeOfferTakeOfferId')
);


const isOfferBelowLimit = createSelector(
  offerTakes, s => s.get('isOfferBelowLimit')
);

const canBuyOffer = createSelector(
  offerTakes,
  activeOfferTakeSellToken,
  rootState => {
    const takeFormValuesSelector = formValueSelector('takeOffer');
    return takeFormValuesSelector(rootState, 'volume', 'total', 'price')
  },
  balances.tokenBalances,
  transactions.canSendTransaction,
  markets.isBuyEnabled,
  (s, sellToken, { total, volume, price }, tokenBalances, canSendTransaction, isBuyEnabled) => {
    if(!canSendTransaction || !isBuyEnabled) { return false; }
    else {
      const userSellTokenBalance = tokenBalances.get(sellToken);
      if(total && isFinite(total) && isFinite(userSellTokenBalance) ) {
        const userSellTokenBalanceBN = new BigNumber(userSellTokenBalance);
        const totalBn = new BigNumber(total);
        return userSellTokenBalanceBN.gte(totalBn)
      } else { return false; }
    }
  }
);


export default {
  state: offerTakes,
  activeOfferTake,
  activeOfferTakeType,
  activeOfferTakeOfferData,
  isOfferTakeModalOpen,
  activeOfferTakeOfferId,
  activeOfferTakeBuyToken,
  activeOfferTakeSellToken,
  activeOfferTakeOfferOwner,
  canBuyOffer,
  isOfferBelowLimit
};