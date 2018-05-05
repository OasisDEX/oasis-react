import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisTokenSelectWrapper from './OasisTokenSelect';
import TokenTransferFormWrapper from './TokenTransferForm';
import OasisTokenBalanceSummary from './OasisTokenBalanceSummary';
import OasisTokenTransferStatusWrapper  from './OasisTokenTransferStatus';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';

import transfersReducer from '../store/reducers/transfers';
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
    const selectToken = <OasisTokenSelectWrapper disabled={disable}
                                                 name={'tokenTransfer'}/>;
    return (
      <OasisWidgetFrame heading="Transfer" spaceForContent={true}
        headingChildren={selectToken}
      >
        <OasisTokenBalanceSummary summary="Wallet" token={selectedToken} decimalPlaces={5} />
        <TokenTransferFormWrapper disabled={disable} onSubmit={this.props.actions.makeTransfer}/>

        <OasisTokenTransferStatusWrapper/>
      </OasisWidgetFrame>
    );
  }
}

export function mapStateToProps(state) {
  const pendingTransferTxSubjectId = transfers.transactionSubjectId(state);
  return {
    transactionReceipt: transactions.getTransferTransaction(state, pendingTransferTxSubjectId),
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
