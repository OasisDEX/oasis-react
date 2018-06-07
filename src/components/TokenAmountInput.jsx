import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE } from '../containers/TokenAmountInputField';
import styles from './TokenAmountInput.scss';
import MaskedTokenAmountInput from "./MaskedTokenAmountInput";

const propTypes = PropTypes && {
};
const defaultProps = {};

class TokenAmountInput extends PureComponent {
  render() {
    const { meta } = this.props;

    const insufficientAmount = (meta.error && meta.error.includes(VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE));

    const errorMessage = <div className={styles.errorMessage}>
      {insufficientAmount && (<div>Insufficient token amount</div>)}
    </div>;

    return (
        <div className={styles.inputGroup}>
          <MaskedTokenAmountInput className={styles.input} {...this.props}/>
          {insufficientAmount && errorMessage}
        </div>
    );
  }
}

TokenAmountInput.displayName = 'TokenAmountInput';
TokenAmountInput.propTypes = propTypes;
TokenAmountInput.defaultProps = defaultProps;
export default TokenAmountInput;
