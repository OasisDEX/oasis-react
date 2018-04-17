import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE } from '../containers/TokenAmountInputField';
// import ImmutablePropTypes from 'react-immutable-proptypes';
import styles from './TokenAmountInput.scss';

const propTypes = PropTypes && {
};
const defaultProps = {};

class TokenAmountInput extends PureComponent {
  render() {
    const { selectedToken, meta } = this.props;

    const insufficientAmount = (meta.error && meta.error.includes(VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE));

    const errorMessage = <div className={styles.errorMessage}>
      {insufficientAmount && (<div>Insufficient token amount</div>)}
    </div>;

    return (
        <div className={styles.inputGroup}>
          <input className={styles.input} {...this.props.input}/>
          <span className={`${styles.currency} `}>
            {selectedToken}
          </span>
          {insufficientAmount && errorMessage}
        </div>
    );
  }
}

TokenAmountInput.displayName = 'TokenAmountInput';
TokenAmountInput.propTypes = propTypes;
TokenAmountInput.defaultProps = defaultProps;
export default TokenAmountInput;
