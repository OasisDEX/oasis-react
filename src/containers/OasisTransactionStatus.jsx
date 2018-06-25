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
import styles from "./OasisTransactionStatus.scss";
import CSSModules from "react-css-modules";
import InfoBox from "../components/InfoBox";
import network from "../store/selectors/network";

const propTypes = PropTypes && {
  actions: PropTypes.object,
  txTimestamp: PropTypes.number,
  txType: PropTypes.string,
  localStatus: PropTypes.string,
  customBlock: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
};

export class OasisTransactionStatusWrapper extends PureComponent {
  hasTransactionFailedOrSignatureDenied() {
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
    if (!this.hasTransactionFailedOrSignatureDenied()) {
      return <TransactionTimer transaction={transaction} />;
    } else {
      return null;
    }
  }

  render() {
    const { transaction, infoText, noBorder, ...props } = this.props;
    return (
      <InfoBox
        justifyContent="space-between"
        alignItems="baseline"
        size="sm"
        fullWidth
        noBorder={noBorder}
        className={styles.base}
        {...props}
      >
        <div className={styles.infoText}>
          {typeof infoText === "function"
            ? infoText(transaction.get("txMeta"))
            : infoText}
        </div>
        <div
          className={
            this.hasTransactionFailedOrSignatureDenied()
              ? styles.statusDanger
              : styles.status
          }
        >
          <TransactionStatus transaction={transaction} />
        </div>
      </InfoBox>
    );
  }
}

export function mapStateToProps(state, { txTimestamp, txType, localStatus }) {
  const status = fromJS({ txStatus: localStatus });
  return {
    networkName: network.activeNetworkName(state),
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
  CSSModules(OasisTransactionStatusWrapper, styles)
);
