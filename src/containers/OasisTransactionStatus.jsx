import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { fromJS } from 'immutable';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import transactions from '../store/selectors/transactions';
import TransactionTimer from '../components/TransactionTimer';
import TransactionStatus from '../components/TransactionStatus';
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
  localStatus: PropTypes.string,
  noBorder: PropTypes.bool,
  inline: PropTypes.bool
};

export class OasisTransactionStatusWrapper extends PureComponent {

  hasTransactionFailed () {
    return [
      TX_STATUS_CANCELLED_BY_USER,
      TX_STATUS_REJECTED
    ].includes(this.props.transaction.get('txStatus'))
  }

  /**
   *  This method is not used at the mment
   * @returns {boolean}
   */
  isAwaitingUserAcceptance () {
    return [
      TX_STATUS_AWAITING_USER_ACCEPTANCE,
    ].includes(this.props.transaction.get('txStatus'))
  }

  /**
   * Not used
   * @returns {*}
   */
  renderTimer() {
    const { transaction } = this.props;
    if (!this.hasTransactionFailed()) {
      return (
        <TransactionTimer transaction={transaction}/>
      );
    }  else { return null; }
  }

  render() {
    const { transaction, noBorder, inline } = this.props;
    return (
      <div className={`${ inline ? 'inlineBlock' : '' }`}>
        <FlexBox className={"full-width"} alignConent="stretch">
          <InfoBox noBorder={noBorder} fullWidth>
            <InfoBoxBody className="no-padding">
              <TransactionStatus transaction={transaction}/>
            </InfoBoxBody>
          </InfoBox>
        </FlexBox>
      </div>
    );
  }
}

export function mapStateToProps(state, { txTimestamp, txType, localStatus }) {
  const status = fromJS({ txStatus: localStatus });
  return {
    transaction: transactions.getTransactionByTimestampAndType(state,  { txTimestamp, txType }) || status
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTransactionStatusWrapper.propTypes = propTypes;
OasisTransactionStatusWrapper.displayName = 'OasisTransactionStatus';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTransactionStatusWrapper);
