import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

const propTypes = PropTypes && {};
const defaultProps = {};


const inputStyle = { textAlign:'right' };


class EthereumAddressInput extends PureComponent {
  render() {
    return (
      <input
        {...this.props.input}
        disabled={this.props.disabled}
        style={inputStyle}
        placeholder={'0x'} type="text"
      />
    );
  }
}

EthereumAddressInput.displayName = 'EthereumAddressInput';
EthereumAddressInput.propTypes = propTypes;
EthereumAddressInput.defaultProps = defaultProps;
export default EthereumAddressInput;
