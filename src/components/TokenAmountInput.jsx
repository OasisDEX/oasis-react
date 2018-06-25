import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE } from "../containers/TokenAmountInputField";
import styles from "./TokenAmountInput.scss";
import MaskedTokenAmountInput from "./MaskedTokenAmountInput";
import InfoBoxWithIco from "./InfoBoxWithIco";

const propTypes = PropTypes && {
  showInlineWarning: PropTypes.bool
};
const defaultProps = {
  showInlineWarning: false
};

class TokenAmountInput extends PureComponent {
  render() {
    const { meta, showInlineWarning } = this.props;

    const insufficientAmount =
      meta.error &&
      meta.error.includes(VALIDATION_ERROR__VALUE_GREATER_THAN_BALANCE);

    const errorMessage = (
      <div className={styles.errorMessage}>
        {showInlineWarning &&
          insufficientAmount && (
            <InfoBoxWithIco color="danger" icon="warning">
              Insufficient token amount
            </InfoBoxWithIco>
          )}
      </div>
    );

    return (
      <div>
        <MaskedTokenAmountInput className={styles.input} {...this.props} />
        {insufficientAmount && errorMessage}
      </div>
    );
  }
}

TokenAmountInput.displayName = "TokenAmountInput";
TokenAmountInput.propTypes = propTypes;
TokenAmountInput.defaultProps = defaultProps;
export default TokenAmountInput;
