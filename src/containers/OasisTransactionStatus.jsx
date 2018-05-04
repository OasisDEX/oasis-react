import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import transactions from '../store/selectors/transactions';
import TransactionTimer from '../components/TransactionTimer';
import TransactionStatus from '../components/TransactionStatus';
import StatusPictogram from '../components/StatusPictogram';
import {
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_REJECTED,
} from '../store/reducers/transactions';
import FlexBox from '../components/FlexBox';
import InfoBox from '../components/InfoBox';
import InfoBoxBody from '../components/InfoBoxBody';

const propTypes = PropTypes && {
  actions: PropTypes.object,
  txTimestamp: PropTypes.number.isRequired,
  txType: PropTypes.string,
};

export class OasisTransactionStatusWrapper extends PureComponent {

  hasTransactionFailed () {
    return [
      TX_STATUS_CANCELLED_BY_USER,
      TX_STATUS_REJECTED
    ].includes(this.props.transaction.get('txStatus'))
  }


  isAwaitingUserAcceptance () {
    return [
      TX_STATUS_AWAITING_USER_ACCEPTANCE,
    ].includes(this.props.transaction.get('txStatus'))
  }

  renderTimer() {
    const { transaction } = this.props;
    if (!this.hasTransactionFailed()) {
      return (
        <TransactionTimer transaction={transaction}/>
      );
    }  else { return null; }
  }

  render() {
    const { transaction } = this.props;
    return (
      <div>
        <FlexBox alignConent="space-around">
          <InfoBox>
            <InfoBoxBody className="no-padding">
              <StatusPictogram status={transaction.get('txStatus')}/>
            </InfoBoxBody>
          </InfoBox>
          <InfoBox>
            <InfoBoxBody className="no-padding">
              {this.renderTimer()}
            </InfoBoxBody>
          </InfoBox>
          <InfoBox>
            <InfoBoxBody className="no-padding">
              <TransactionStatus transaction={transaction}/>
            </InfoBoxBody>
          </InfoBox>
        </FlexBox>
      </div>
    );
  }
}

export function mapStateToProps(state, { txTimestamp, txType }) {
  return {
    transaction: transactions.getTransactionByTimestampAndType(state,  { txTimestamp, txType })
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTransactionStatusWrapper.propTypes = propTypes;
OasisTransactionStatusWrapper.displayName = 'OasisTransactionStatus';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTransactionStatusWrapper);
