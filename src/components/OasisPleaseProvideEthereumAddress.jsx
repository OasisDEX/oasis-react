import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

// import styles from './OasisPleaseProvideEthereumAddress.scss';
import InfoBoxWithIco from './InfoBoxWithIco';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisPleaseProvideEthereumAddress extends PureComponent {
  render() {
    return (
      <InfoBoxWithIco icon="warning" color="danger">
        Please provide <b>Ethereum address</b> !
      </InfoBoxWithIco>
    );
  }
}

OasisPleaseProvideEthereumAddress.displayName = 'OasisPleaseProvideEthereumAddress';
OasisPleaseProvideEthereumAddress.propTypes = propTypes;
OasisPleaseProvideEthereumAddress.defaultProps = defaultProps;
export default OasisPleaseProvideEthereumAddress;
