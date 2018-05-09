import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisProcessingOrder.scss";
import OasisTransactionStatusWrapper from "../containers/OasisTransactionStatus";

const propTypes = PropTypes && {
  localStatus: PropTypes.string,
  txType: PropTypes.string,
  txTimestamp: PropTypes.number
};
const defaultProps = {};



export class OasisProcessingOrder extends PureComponent {
  static customBlock() {
    return (
      <div>Process order</div>
    );
  }
  transactionInfo() {
    const { localStatus, txType, txTimestamp } = this.props;
    return (
      <OasisTransactionStatusWrapper
        customBlock={OasisProcessingOrder.customBlock()}
        txType={txType}
        localStatus={localStatus}
        txTimestamp={txTimestamp}
      />
    );
  }
  render() {
    return <div className={styles.base}>{this.transactionInfo()}</div>;
  }
}

OasisProcessingOrder.displayName = "OasisProcessingOrder";
OasisProcessingOrder.propTypes = propTypes;
OasisProcessingOrder.defaultProps = defaultProps;
export default OasisProcessingOrder;
