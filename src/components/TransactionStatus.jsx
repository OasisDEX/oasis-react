import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import StatusPictogram from "./StatusPictogram";

import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import EtherscanLink, {
  ETHERSCAN_LINK_TYPE_TRANSACTION
} from "./EtherscanLink";

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
          <div>
            Sign Trans. <StatusPictogram status={transaction.get("txStatus")} />
          </div>
        );
      case TX_STATUS_CANCELLED_BY_USER:
        return <div>Transaction cancelled by the user</div>;
      case TX_STATUS_AWAITING_CONFIRMATION:
        return (
          <div>
            <EtherscanLink
              type={ETHERSCAN_LINK_TYPE_TRANSACTION}
              txHash={transaction.get("txHash")}
            />
            <StatusPictogram status={transaction.get("txStatus")} />
          </div>
        );
      case TX_STATUS_CONFIRMED:
        return (
          <div>
            <EtherscanLink
              label={"Confirmed"}
              type={ETHERSCAN_LINK_TYPE_TRANSACTION}
              txHash={transaction.get("txHash")}
            />
            <StatusPictogram status={transaction.get("txStatus")} />
          </div>
        );

      case TX_STATUS_REJECTED:
        return (
          <div>
            <StatusPictogram status={transaction.get("txStatus")} />
            Your transaction
            <EtherscanLink
              type={ETHERSCAN_LINK_TYPE_TRANSACTION}
              txHash={transaction.get("txHash")}
            />{" "}
            failed
          </div>
        );
    }
  }
}

TransactionStatus.displayName = "TransactionStatus";
TransactionStatus.propTypes = propTypes;
TransactionStatus.defaultProps = defaultProps;
export default TransactionStatus;
