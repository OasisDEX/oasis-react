import { createSelector } from 'reselect';
import { formValueSelector } from 'redux-form/immutable';
import balances from './balances';
import transactions from './transactions';
import markets from './markets';
import web3 from '../../bootstrap/web3';
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../reducers/offerTakes';
import { ETH_UNIT_ETHER } from '../../constants';

const offerTakes = s => s.get('offerTakes');

const activeOfferTake = createSelector(
  offerTakes, s => s.get('activeOfferTake'),
);

const activeOfferTakeType = createSelector(
  offerTakes, s => s.get('activeOfferTakeType'),
);

const activeOfferTakeOfferData = createSelector(
  offerTakes, s => s.getIn(['activeOfferTake', 'offerData']),
);

const activeOfferTakeOfferOwner = createSelector(
  offerTakes, s => s.getIn(['activeOfferTake', 'offerData', 'owner']),
);

const activeOfferTakeBuyToken = createSelector(
  offerTakes, s => s.getIn(['activeOfferTake', 'buyToken']),
);

const activeOfferTakeSellToken = createSelector(
  offerTakes, s => s.getIn(['activeOfferTake', 'sellToken']),
);

const isOfferTakeModalOpen = createSelector(
  offerTakes, s => s.get('isOfferTakeModalOpen'),
);
const activeOfferTakeOfferId = createSelector(
  offerTakes, s => s.get('activeOfferTakeOfferId'),
);


const takeFormValuesSelector = formValueSelector('takeOffer');


const isOfferBelowLimit = createSelector(
  offerTakes, s => s.get('isOfferBelowLimit'),
);

const hasSufficientTokenAmount = createSelector(
  balances.tokenBalances,
  activeOfferTakeSellToken,
  activeOfferTakeType,
  rootState => takeFormValuesSelector(rootState, 'volume', 'total', 'price'),
  (tokenBalances, sellToken,  activeOfferTakeType, { total, volume, price }) => {
    if(!total && !volume && !price) { return false; }
    else {
      const totalInWei = web3.toWei(total, ETH_UNIT_ETHER);
      const volumeInWei = web3.toWei(volume, ETH_UNIT_ETHER);
      const usersSellTokenBalanceBN = web3.toBigNumber(tokenBalances.get(sellToken));
      switch (activeOfferTakeType) {
        case TAKE_BUY_OFFER:  return usersSellTokenBalanceBN.gte(volumeInWei);
        case TAKE_SELL_OFFER: return usersSellTokenBalanceBN.gte(totalInWei);
      }

    }
  }
);

const currentFormVolume = createSelector(
  rootState => takeFormValuesSelector(rootState, 'volume'),
  volume => volume
);

const isVolumeEmptyOrZero = createSelector(
  rootState => takeFormValuesSelector(rootState, 'volume'),
  activeFormVolume => activeFormVolume.length === 0 || web3.toBigNumber(activeFormVolume).eq(0)
);
const isVolumeGreaterThanOfferMax = createSelector(
  currentFormVolume,
  activeOfferTakeOfferData,
  activeOfferTakeType,
  (volume, offerData, offerTakeType) => {
    const buyHowMuch = web3.fromWei(offerData.get('buyHowMuch'));
    const sellHowMuch = web3.fromWei(offerData.get('sellHowMuch'));
    const volumeBN = web3.toBigNumber(volume);
    switch (offerTakeType) {
      case TAKE_BUY_OFFER:  return volumeBN.gt(buyHowMuch)  ? buyHowMuch : false;
      case TAKE_SELL_OFFER: return volumeBN.gt(sellHowMuch) ? sellHowMuch : false;
    }
  }
);

const canBuyOffer = createSelector(
  hasSufficientTokenAmount,
  rootState => transactions.canSendTransaction(rootState),
  markets.isBuyEnabled,
  rootState =>
    balances.tokenAllowanceTrustStatus(
      rootState,
      {
        tokenName: activeOfferTakeBuyToken(rootState),
        allowanceSubjectAddress: activeOfferTakeOfferOwner(rootState)
      }
  ),
  isVolumeEmptyOrZero,
  isVolumeGreaterThanOfferMax,
  (
    hasSufficientTokenAmount,
    canSendTransaction,
    isBuyEnabled,
    isOfferOwnerTrusted,
    isVolumeZero,
    isVolumeGreaterThanOfferMax
  ) => {

    if (isVolumeZero|| isVolumeGreaterThanOfferMax || !canSendTransaction || !isBuyEnabled || !isOfferOwnerTrusted ) {
      return false;
    } else {
      return hasSufficientTokenAmount;
    }
  },
);

const isOfferActive = createSelector(
  offerTakes, s => s.get('isOfferActive')
);

const transactionGasCostEstimate = createSelector(
  offerTakes,
  s => s.get('transactionGasCostEstimate')
);

const checkingIfOfferIsActive = createSelector(
  offerTakes,
  s => s.get('checkingIfOfferActive')
);

const gasEstimatePending = createSelector(
  offerTakes,
  s => s.get('transactionGasCostEstimatePending')
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
  isOfferBelowLimit,
  takeFormValuesSelector,
  hasSufficientTokenAmount,
  transactionGasCostEstimate,
  isVolumeGreaterThanOfferMax,
  isVolumeEmptyOrZero,
  isOfferActive,
  checkingIfOfferIsActive,
  gasEstimatePending
};