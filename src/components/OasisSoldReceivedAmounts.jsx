import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisSoldReceivedAmounts.scss";
import FlexBox from "./FlexBox";
import CSSModules from "react-css-modules/dist/index";
import OasisSignificantDigitsWrapper from "../containers/OasisSignificantDigits";

const propTypes = PropTypes && {
  sellToken: PropTypes.string.isRequired,
  buyToken: PropTypes.string.isRequired,
  amountSold: PropTypes.string.isRequired,
  amountReceived: PropTypes.string.isRequired
};
const defaultProps = {};

const TokenAmount = ({ tokenName, tokenAmount, sign, color, ...props }) => (
  <FlexBox alignItems="center" {...props}>
    <span className={`${styles.circleIco} ${styles[color]}`}>{sign}</span>
    <span className={styles.baseText}>
      { tokenAmount !== 'N/A' ? (
        <OasisSignificantDigitsWrapper amount={tokenAmount.toString()} />
      ) : (
        "N/A"
      )}&nbsp;
    </span>
    <span className={styles.bolderText}>{tokenName}</span>
  </FlexBox>
);

TokenAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string,
  sign: PropTypes.string,
  color: PropTypes.string
};

const TokenReceivedAmount = ({ tokenName, tokenAmount, ...props }) => (
  <TokenAmount
    tokenName={tokenName}
    tokenAmount={tokenAmount}
    sign="+"
    color="green"
    {...props}
  />
);

TokenReceivedAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string
};

const TokenSoldAmount = ({ tokenName, tokenAmount, ...props }) => (
  <TokenAmount
    tokenName={tokenName}
    tokenAmount={tokenAmount}
    sign="-"
    color="red"
    {...props}
  />
);

TokenSoldAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string
};

export class OasisSoldReceivedAmounts extends PureComponent {
  render() {
    const {
      amountReceived,
      amountSold,
      sellToken,
      buyToken,
      ...props
    } = this.props;
    return (
      <div {...props}>
        <FlexBox className={styles.buying}>
          <TokenReceivedAmount
            tokenAmount={amountReceived}
            tokenName={buyToken}
            className={styles.detailsAmountCol}
          />
        </FlexBox>
        <FlexBox>
          <TokenSoldAmount
            tokenAmount={amountSold}
            tokenName={sellToken}
            className={styles.detailsAmountCol}
          />
        </FlexBox>
      </div>
    );
  }
}

OasisSoldReceivedAmounts.displayName = "OasisSoldReceivedAmounts";
OasisSoldReceivedAmounts.propTypes = propTypes;
OasisSoldReceivedAmounts.defaultProps = defaultProps;
export default CSSModules(OasisSoldReceivedAmounts, styles);
