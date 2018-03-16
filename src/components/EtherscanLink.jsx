import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

const propTypes = PropTypes && {
  label: PropTypes.string,
  networkName: PropTypes.string,
  txHash: PropTypes.string,
  address: PropTypes.string,
  type: PropTypes.oneOf(
    [
      ETHERSCAN_LINK_TYPE_ADDRESS,
      ETHERSCAN_LINK_TYPE_TRANSACTION
    ]
  )
};
const defaultProps = {
  networkName: 'kovan'
};

export const ETHERSCAN_LINK_TYPE_ADDRESS = 'ETHERSCAN_LINK_TYPE_ADDRESS';
export const ETHERSCAN_LINK_TYPE_TRANSACTION = 'ETHERSCAN_LINK_TYPE_TRANSACTION';


const linkStyle = { maxWidth:'100px', textOverflow: 'ellipsis', display: 'inline-block', overflow: 'hidden' };

class EtherscanLink extends PureComponent {
  render() {
    const { txHash, label, networkName, address } = this.props;
    switch (this.props.type) {
      case ETHERSCAN_LINK_TYPE_TRANSACTION: {
        const url = `https://${networkName}.etherscan.io/tx/${txHash}`;
        return (
          <a style={linkStyle} href={url}>
            <span>{label||txHash}</span>
          </a>
        );
      }
      case ETHERSCAN_LINK_TYPE_ADDRESS: {
        const url = `https://${networkName}.etherscan.io/address/${address}`;
        return (
          <a style={linkStyle} href={url}>
            <span>{label||address}</span>
          </a>
        );
      }
    }
  }
}

EtherscanLink.displayName = 'EthercanLink';
EtherscanLink.propTypes = propTypes;
EtherscanLink.defaultProps = defaultProps;
export default EtherscanLink;
