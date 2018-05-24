import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { fromJS } from "immutable";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import transactions from "../store/selectors/transactions";
import TransactionTimer from "../components/TransactionTimer";
import TransactionStatus from "../components/TransactionStatus";
import {
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import textStyles from "../styles/modules/_typography.scss";
import CSSModules from "react-css-modules";
import InfoBox from '../components/InfoBox';

const propTypes = PropTypes && {
  actions: PropTypes.object,
  txTimestamp: PropTypes.number,
  txType: PropTypes.string,
  localStatus: PropTypes.string,
  customBlock: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
};

export class OasisTransactionStatusWrapper extends PureComponent {
  hasTransactionFailed() {
    return [TX_STATUS_CANCELLED_BY_USER, TX_STATUS_REJECTED].includes(
      this.props.transaction.get("txStatus")
    );
  }

  /**
   *  This method is not used at the mment
   * @returns {boolean}
   */
  isAwaitingUserAcceptance() {
    return [TX_STATUS_AWAITING_USER_ACCEPTANCE].includes(
      this.props.transaction.get("txStatus")
    );
  }

  /**
   * Not used
   * @returns {*}
   */
  renderTimer() {
    const { transaction } = this.props;
    if (!this.hasTransactionFailed()) {
      return <TransactionTimer transaction={transaction} />;
    } else {
      return null;
    }
  }

  render() {
    const { transaction, infoText } = this.props;
    console.log({ transaction, infoText });
    return (
      <InfoBox justifyContent="space-between" alignItems="baseline" size="sm" fullWidth>
        <div className={this.hasTransactionFailed() ? textStyles.textDanger : ""} style={{display: 'flex', alignContent: 'space-between'}}>
          <div>
            { typeof infoText === 'function' ? infoText(transaction.get('txMeta')) : infoText }
          </div>
          <TransactionStatus transaction={transaction} noBorder />
        </div>
      </InfoBox>
    );
  }
}

export function mapStateToProps(state, { txTimestamp, txType, localStatus }) {
  const status = fromJS({ txStatus: localStatus });
  return {
    transaction:
      transactions.getTransactionByTimestampAndType(state, {
        txTimestamp,
        txType
      }) || status
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTransactionStatusWrapper.propTypes = propTypes;
OasisTransactionStatusWrapper.displayName = "OasisTransactionStatus";
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModules(OasisTransactionStatusWrapper, textStyles)
);
