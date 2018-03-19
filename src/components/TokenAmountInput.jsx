import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { greaterThanZeroValidator } from '../utils/forms/offers';
import { VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE } from '../containers/TokenAmountInputField';
// import ImmutablePropTypes from 'react-immutable-proptypes';

const propTypes = PropTypes && {
};
const defaultProps = {};

const inputStyle = { textAlign: 'right', width: '100%' };


class TokenAmountInput extends PureComponent {
  render() {
    const { selectedToken, meta } = this.props;

    const insufficientAmount = (meta.error && meta.error.includes(VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE));
    return (
      <div>
        <div style={{ display: 'flex' }}>
          <input style={inputStyle} {...this.props.input}/>
          <span style={{ display: 'inline-block', padding: '4px', backgroundColor: '#fff', borderColor: 'ligghtgray' }}>
            {selectedToken}
          </span>
        </div>
        <div>
          {insufficientAmount && (<div>Insufficient token amount</div>)}
        </div>
      </div>
    );
  }
}

TokenAmountInput.displayName = 'TokenAmountInput';
TokenAmountInput.propTypes = propTypes;
TokenAmountInput.defaultProps = defaultProps;
export default TokenAmountInput;
