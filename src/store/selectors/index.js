import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';
import { TX_OFFER_MAKE, TX_OFFER_TAKE } from '../reducers/transactions';
import { fromJS } from 'immutable';


const isGasEstimatePending = createSelector(
  s => s,
  reselect.getProps,
  (rootState, transactionSubjectType) => {
    switch (transactionSubjectType) {
      case TX_OFFER_TAKE: return rootState.getIn(['offerTakes', 'transactionGasCostEstimatePending']);
      case TX_OFFER_MAKE: return rootState.getIn(['offerMakes', 'transactionGasCostEstimatePending'])
    }
  }
);

const gasEstimateError = createSelector(
  s => s,
  reselect.getProps,
  (rootState, transactionSubjectType) => {
    switch (transactionSubjectType) {
      case TX_OFFER_TAKE: return rootState.getIn(['offerTakes', 'transactionGasCostEstimateError']);
      case TX_OFFER_MAKE: return rootState.getIn(['offerMakes', 'transactionGasCostEstimateError'])
    }
  }
);


const transactionGasCostEstimate = createSelector(
  s => s,
  reselect.getProps,
  (rootState, transactionSubjectType) => {
    switch (transactionSubjectType) {
      case TX_OFFER_TAKE: return rootState.getIn(['offerTakes', 'transactionGasCostEstimate']);
      case TX_OFFER_MAKE: return rootState.getIn(['offerMakes', 'transactionGasCostEstimate'])
    }
  }
);

const gasEstimateInfo = createSelector(
  s => s,
  reselect.getProps,
  (rootState, transactionSubjectType) => {
    switch (transactionSubjectType) {
      case TX_OFFER_TAKE: return fromJS({
        isGasEstimatePending: rootState.getIn(['offerTakes', 'transactionGasCostEstimatePending']),
        transactionGasCostEstimate : rootState.getIn(['offerTakes', 'transactionGasCostEstimate']),
        transactionGasCostEstimateError : rootState.getIn(['offerTakes', 'transactionGasCostEstimateError'])
      });
      case TX_OFFER_MAKE: return rootState.getIn(['offerMakes', 'transactionGasCostEstimate'])
    }
  }
);



export {
  isGasEstimatePending,
  gasEstimateError,
  transactionGasCostEstimate,
  gasEstimateInfo
}