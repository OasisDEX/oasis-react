import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reset } from 'redux-form/immutable';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import transactions from '../store/selectors/transactions';
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_CANCELLED_BY_USER, TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED,
} from '../store/reducers/transactions';
import transfersReducer from '../store/reducers/transfers';
import transfers from '../store/selectors/transfers';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  transactionReceipt: ImmutablePropTypes.map
};


const isCancelledConfirmedOrFailed = (transactionMap) =>
  [
    TX_STATUS_CANCELLED_BY_USER,
    TX_STATUS_CONFIRMED,
    TX_STATUS_REJECTED
  ].includes(transactionMap.get('txStatus'));


export class OasisTokenTransferStatusWrapper extends PureComponent {
  transactionInfo() {
    const { transaction } = this.props;
    return (
      <div>
        <div>Address: {transaction.getIn(['txMeta', 'recipient'])}</div>
        <div>Token: {transaction.getIn(['txMeta', 'token'])}</div>
        <div>amount: {transaction.getIn(['txMeta', 'tokenAmount'])}</div>
      </div>
    )
  }
  transferStatus() {
    const { pendingTransferTxSubjectId, transaction } = this.props;
    if (pendingTransferTxSubjectId && !transaction) {
      return 'waiting for You to accept transaction';
    } else if (transaction) {
      switch (transaction.get('txStatus')) {
        case TX_STATUS_AWAITING_CONFIRMATION:
          return (
            <div>
              {this.transactionInfo()}
              <div>Status: pending</div>
            </div>
          );
        case TX_STATUS_CANCELLED_BY_USER:
          return (
            <div>
              {this.transactionInfo()}
              <div>Status: cancelled</div>
            </div>
          );
        case TX_STATUS_REJECTED:
          return (
            <div>
              {this.transactionInfo()}
              <div>Status: rejected</div>
            </div>
          );
        case TX_STATUS_CONFIRMED:
          return (
            <div>
              {this.transactionInfo()}
              <div>Status: confirmed</div>
            </div>
          );
      }
    } else { return null; }
  }
  render() {
    return (this.transferStatus());
  }
  componentWillUpdate(nextProps) {
    if (!nextProps.transactionReceipt) { return; }
    else if (isCancelledConfirmedOrFailed(nextProps.transactionReceipt)) {
      setTimeout(
        () => {
          this.props.actions.resetTransactionSubjectId();
          this.props.actions.resetForm('tokenTransfer');
        }, 1000
      );
    }
  }
}

export function mapStateToProps(state) {
  const pendingTransferTxSubjectId = transfers.transactionSubjectId(state);
  return {
    pendingTransferTxSubjectId,
    transactionReceipt: transactions.getTransferTransaction(state, pendingTransferTxSubjectId)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    resetForm: reset,
    resetTransactionSubjectId: transfersReducer.actions.resetPendingTransferTransactionSubjectId
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenTransferStatusWrapper.propTypes = propTypes;
OasisTokenTransferStatusWrapper.displayName = 'TokenTransferStatus';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTokenTransferStatusWrapper);
