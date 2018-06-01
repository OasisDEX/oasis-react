import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import EtherscanLink, {
  ETHERSCAN_LINK_TYPE_ADDRESS,
  ETHERSCAN_LINK_TYPE_TRANSACTION,
} from '../components/EtherscanLink';
import network from '../store/selectors/network';

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

export class EtherscanLinkWrapper extends PureComponent {
  render() {
    return (
      <EtherscanLink {...this.props}/>
    );
  }
}

export function mapStateToProps(state) {
  return {
    networkName: network.activeNetworkName(state)
  };
}
export function mapDispatchToProps() {
  return {};
}

EtherscanLinkWrapper.propTypes = propTypes;
EtherscanLinkWrapper.displayName = 'EtherscanLink';

export default connect(mapStateToProps, mapDispatchToProps)(EtherscanLinkWrapper);
