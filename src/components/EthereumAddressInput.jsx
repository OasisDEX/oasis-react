import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

const propTypes = PropTypes && {};
const defaultProps = {};


const inputStyle = { textAlign:'right', width: '100%' };


class EthereumAddressInput extends PureComponent {
  render() {
    return (
      <input
        {...this.props.input}
        style={inputStyle}
        placeholder={'Ox'} type="text"
      />
    );
  }
}

EthereumAddressInput.displayName = 'EthereumAddressInput';
EthereumAddressInput.propTypes = propTypes;
EthereumAddressInput.defaultProps = defaultProps;
export default EthereumAddressInput;
