import { createSelector } from 'reselect';
import { formValueSelector } from 'redux-form/immutable';
import tokenSelectors from './tokenSelectors';

const transfers = s => s.get('transfers');

const getMakeTransferFormValues = createSelector(
  rootState => formValueSelector('tokenTransfer')(rootState, 'token' , 'tokenAmount', 'recipient'),
  formValues => formValues
);

const selectedToken = createSelector(
  rootState => tokenSelectors.selectedToken(rootState, 'tokenTransfer'),
  selectedToken => selectedToken
);

const transactionSubjectId = createSelector(
  transfers,
  s => s.get('txSubjectId')
);

export default {
  state: transfers,
  getMakeTransferFormValues,
  selectedToken,
  transactionSubjectId
}