import { createSelector } from 'reselect';
import { formValueSelector } from 'redux-form/immutable';
import balances from './balances';
import transactions from './transactions';
import markets from './markets';
import web3 from '../../bootstrap/web3';
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../reducers/offerMakes';
import reselect from '../../utils/reselect';
import offerMakeToFormName from '../../utils/offers/offerMakeToFormName';
import tokens from './tokens';

const offerMakes = state => state.get('offerMakes');

const activeOfferMake = createSelector(
  offerMakes,
  reselect.getProps,
  (state, offerMakeType) => state.getIn([ offerMakeType, 'activeOfferMake'])
);

const activeOfferMakeType = createSelector(
  offerMakes, state => state.get('activeOfferMakeType'),
);

const activeOfferMakeOfferData = createSelector(
  offerMakes,
  activeOfferMakeType,
  (state, amt) => state.getIn([offerMakeToFormName(amt), 'activeOfferMake', 'offerData']),
);

const activeOfferMakeOfferOwner = createSelector(
  offerMakes, state => state.getIn(['activeOfferMake', 'offerData', 'owner']),
);

const activeOfferMakeBuyToken = createSelector(
  offerMakes,
  reselect.getProps,
  (state, formName) => state.getIn([formName, 'activeOfferMake', 'buyToken']),
);

const activeOfferMakeSellToken = createSelector(
  offerMakes,
  reselect.getProps,
  (state, formName) => state.getIn([formName, 'activeOfferMake', 'sellToken']),
);

const isOfferMakeModalOpen = createSelector(
  offerMakes,
  reselect.getProps,
  (state, offerMakeType) => {
   return state.getIn([offerMakeToFormName(offerMakeType), 'isOfferMakeModalOpen'])
  }
);


const makeFormValuesSelector = formName => {
  return formValueSelector(formName);
};


const isOfferBelowLimit = createSelector(
  offerMakes, state => state.get('isOfferBelowLimit'),
);

const hasSufficientTokenAmount = createSelector(
  balances.tokenBalances,
  reselect.getProps,
  (rootState, offerMakeType) => makeFormValuesSelector(
    offerMakeToFormName(offerMakeType)
  )(rootState, 'volume', 'total'),
  tokens.activeTradingPair,
  (tokenBalances,  activeOfferMakeType, { total, volume }, { baseToken, quoteToken }) => {
    if( !total || parseFloat(total) === 0) { return null; }
    else {
      switch (activeOfferMakeType) {
        case MAKE_BUY_OFFER:  {
          const usersSellTokenBalanceBN = web3.toBigNumber(tokenBalances.get(quoteToken));
          return usersSellTokenBalanceBN.gte(web3.toWei(total));
        }
        case MAKE_SELL_OFFER: {
          const usersSellTokenBalanceBN = web3.toBigNumber(tokenBalances.get(baseToken));
          return usersSellTokenBalanceBN.gte(web3.toWei(volume));
        }
      }

    }
  }
);

const currentFormValues = createSelector(
  (rootState, formName) => makeFormValuesSelector(formName)(rootState, 'volume', 'price', 'total'),
  formValues => formValues
);

const isVolumeEmptyOrZero = createSelector(
  (rootState, offerMakeType) => makeFormValuesSelector(offerMakeToFormName(offerMakeType))(rootState, 'volume'),
  activeFormVolume => {
    return !activeFormVolume || web3.toBigNumber(activeFormVolume).lte(0);
  }
);

const canMakeOffer = createSelector(
  hasSufficientTokenAmount,
  rootState => transactions.canSendTransaction(rootState),
  markets.isBuyEnabled,
  (rootState, offerMakeType) => balances.tokenAllowanceTrustStatus(
      rootState,
      {
        tokenName: activeOfferMakeBuyToken(rootState, offerMakeToFormName(offerMakeType)),
        allowanceSubjectAddress: window.contracts.market.address
      }
  ),
  isVolumeEmptyOrZero,
  (
    hasSufficientTokenAmount,
    canSendTransaction,
    isBuyEnabled,
    isMarketTrusted,
    isVolumeZero,
  ) => {
    if (isVolumeZero || !hasSufficientTokenAmount || !canSendTransaction || !isBuyEnabled || !isMarketTrusted ) {
      return false;
    } else {
      return hasSufficientTokenAmount;
    }
  }
);

const isOfferActive = createSelector(
  offerMakes, state => state.get('isOfferActive')
);

const transactionGasCostEstimate = createSelector(
  offerMakes,
  state => state.get('transactionGasCostEstimate')
);

const checkingIfOfferIsActive = createSelector(
  offerMakes,
  state => state.get('checkingIfOfferActive')
);

const gasEstimatePending = createSelector(
  offerMakes,
  state => state.get('transactionGasCostEstimatePending')
);

const activeOfferMakeTxSubjectId = createSelector(
  offerMakes,
  activeOfferMakeType,
  (state, aomt) => state.getIn([offerMakeToFormName(aomt), 'txSubjectId'])
);





export default {
  state: offerMakes,
  activeOfferMake,
  activeOfferMakeType,
  activeOfferMakeOfferData,
  isOfferMakeModalOpen,
  activeOfferMakeBuyToken,
  activeOfferMakeSellToken,
  activeOfferMakeOfferOwner,
  canMakeOffer,
  isOfferBelowLimit,
  hasSufficientTokenAmount,
  transactionGasCostEstimate,
  isVolumeEmptyOrZero,
  isOfferActive,
  checkingIfOfferIsActive,
  currentFormValues,
  activeOfferMakeTxSubjectId,
  gasEstimatePending,

};
