import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import createEtherscanTransactionLink from "../utils/createEtherscanTransactionLink";
// import ImmutablePropTypes from 'react-immutable-proptypes';

export const ETHERSCAN_LINK_TYPE_ADDRESS = "ETHERSCAN_LINK_TYPE_ADDRESS";
export const ETHERSCAN_LINK_TYPE_TRANSACTION =
  "ETHERSCAN_LINK_TYPE_TRANSACTION";

import styles from "./EtherscanLink.scss";
import CSSModules from "react-css-modules";

const propTypes = PropTypes && {
  label: PropTypes.string,
  networkName: PropTypes.string,
  txHash: PropTypes.string,
  address: PropTypes.string,
  type: PropTypes.oneOf([
    ETHERSCAN_LINK_TYPE_ADDRESS,
    ETHERSCAN_LINK_TYPE_TRANSACTION
  ])
};
const defaultProps = {
};

class EtherscanLink extends PureComponent {
  render() {
    const { txHash, label, networkName, address, ...props } = this.props;
    const url = createEtherscanTransactionLink({
      activeNetworkName: networkName,
      transactionHash: txHash
    });
    switch (this.props.type) {
      case ETHERSCAN_LINK_TYPE_TRANSACTION: {
        return (
          <a target="_blank" rel="noreferrer noopener" className={styles.link} href={url} {...props}>
            <span>{label || txHash}</span>
          </a>
        );
      }
      case ETHERSCAN_LINK_TYPE_ADDRESS: {
        return (
          <a rel="noopener noreferrer" target="_blank" className={styles.link} href={url} {...props}>
            <span>{label || address}</span>
          </a>
        );
      }
    }
  }
}

EtherscanLink.displayName = "EtherscanLink";
EtherscanLink.propTypes = propTypes;
EtherscanLink.defaultProps = defaultProps;
export default CSSModules(EtherscanLink, styles);
