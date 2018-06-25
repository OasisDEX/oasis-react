import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import StatusPictogram from "./StatusPictogram";
import FlexBox from "./FlexBox";
import styles from "./TransactionStatus.scss";
import CSSModules from "react-css-modules";

import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import {
  ETHERSCAN_LINK_TYPE_TRANSACTION
} from "./EtherscanLink";
import EtherscanLinkWrapper from '../containers/EtherscanLink';

const propTypes = PropTypes && {
  transaction: ImmutablePropTypes.map.isRequired
};
const defaultProps = {};

class TransactionStatus extends PureComponent {
  render() {
    const { transaction } = this.props;
    switch (transaction.get("txStatus")) {
      case TX_STATUS_AWAITING_USER_ACCEPTANCE:
        return (
          <div style={{paddingTop: '1px', color: '#68676B'}}>
            Sign Trans.<StatusPictogram
              status={transaction.get("txStatus")}
              className={styles.imgRight}
            />
          </div>
        );
      case TX_STATUS_CANCELLED_BY_USER:
        return <div>Rejected</div>;
      case TX_STATUS_AWAITING_CONFIRMATION:
        return (
          <FlexBox alignItems="baseline">
            <EtherscanLinkWrapper
              type={ETHERSCAN_LINK_TYPE_TRANSACTION}
              txHash={transaction.get("txHash")}
            />
            <StatusPictogram
              status={transaction.get("txStatus")}
              className={styles.imgRight}
            />
          </FlexBox>
        );
      case TX_STATUS_CONFIRMED:
        return (
          <FlexBox alignItems="baseline" additionalStyles={{paddingTop: '2px'}}>
            <EtherscanLinkWrapper
              label={"Confirmed"}
              type={ETHERSCAN_LINK_TYPE_TRANSACTION}
              txHash={transaction.get("txHash")}
            />
            <StatusPictogram
              status={transaction.get("txStatus")}
              className={styles.imgRight}
            />
          </FlexBox>
        );

      case TX_STATUS_REJECTED:
        console.log("TX_STATUS_REJECTED", styles.transactionFailedHash, styles);
        return (
          <FlexBox alignItems="baseline">
            <StatusPictogram
              status={transaction.get("txStatus")}
              className={styles.imgLeft}
            />
            Your transaction
            <span className={styles.transactionFailedHash}>
              <EtherscanLinkWrapper
                className={styles.spaceBoth}
                type={ETHERSCAN_LINK_TYPE_TRANSACTION}
                txHash={transaction.get("txHash")}
              />{" "}
            </span>
            failed
          </FlexBox>
        );
    }
  }
}

TransactionStatus.displayName = "TransactionStatus";
TransactionStatus.propTypes = propTypes;
TransactionStatus.defaultProps = defaultProps;
export default CSSModules(TransactionStatus, styles);
