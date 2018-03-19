import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisTokenSelectWrapper from './OasisTokenSelect';
import TokenTransferFormWrapper from './TokenTransferForm';
import OasisTokenTransferStatusWrapper  from './OasisTokenTransferStatus';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';

import transfersReducer from '../store/reducers/transfers';
import OasisTokenBalanceWrapper  from './OasisTokenBalance';
import transfers from '../store/selectors/transfers';
import { TX_STATUS_AWAITING_CONFIRMATION } from '../store/reducers/transactions';
import transactions from '../store/selectors/transactions';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  selectedToken: PropTypes.string
};



export class OasisTokenTransferWrapper extends PureComponent {
  render() {
    const { selectedToken, transaction } = this.props;
    const disable = transaction && transaction.get('txStatus') === TX_STATUS_AWAITING_CONFIRMATION;
    return (
      <OasisWidgetFrame heading="Transfer">
        <div>
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <span style={{ width: '50%', textTransform: 'uppercase' }}>Wallet</span>
            <OasisTokenBalanceWrapper style={{ width: '50%' }} decimalPlaces={5} tokenName={selectedToken}/>
          </div>
          <hr/>
          <div>
            <OasisTokenSelectWrapper disabled={disable} name={'tokenTransfer'}/>
            <TokenTransferFormWrapper disabled={disable} onSubmit={this.props.actions.makeTransfer}/>
          </div>
          <div>
            <hr/>
            <OasisTokenTransferStatusWrapper/>
          </div>
        </div>
      </OasisWidgetFrame>
    );
  }
}

export function mapStateToProps(state) {
  const pendingTransferTxSubjectId = transfers.transactionSubjectId(state);
  return {
    transaction: transactions.getTransferTransaction(state, pendingTransferTxSubjectId),
    selectedToken: transfers.selectedToken(state),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    makeTransfer: transfersReducer.actions.makeTransferEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenTransferWrapper.propTypes = propTypes;
OasisTokenTransferWrapper.displayName = 'OasisTokenTransfer';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTokenTransferWrapper);
