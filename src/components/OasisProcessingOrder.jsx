import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisProcessingOrder.scss";
import OasisTransactionStatusWrapper from "../containers/OasisTransactionStatus";
import {InfoBox} from "./InfoBox";

const propTypes = PropTypes && {
  localStatus: PropTypes.string,
  txType: PropTypes.string,
  txTimestamp: PropTypes.number
};
const defaultProps = {};



export class OasisProcessingOrder extends PureComponent {

  transactionInfo() {
    const { localStatus, txType, txTimestamp } = this.props;
    return (
      <OasisTransactionStatusWrapper
        txType={txType}
        localStatus={localStatus}
        txTimestamp={txTimestamp}
      />
    );
  }
  render() {
    const {title} = this.props;
    return <InfoBox justifyContent="space-between" alignItems="baseline">
      <strong>{title}</strong>
      {this.transactionInfo()}
    </InfoBox>;
  }
}

OasisProcessingOrder.displayName = "OasisProcessingOrder";
OasisProcessingOrder.propTypes = propTypes;
OasisProcessingOrder.defaultProps = defaultProps;
export default OasisProcessingOrder;
