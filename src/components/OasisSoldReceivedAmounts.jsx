import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisSoldReceivedAmounts.scss";
import FlexBox from "./FlexBox";
import CSSModules from "react-css-modules/dist/index";
import OasisSignificantDigitsWrapper from "../containers/OasisSignificantDigits";
import OasisIcon from "./OasisIcon";

const TokenAmount = ({
  tokenName,
  tokenAmount,
  tokenAmountFullPrecision,
  icon,
  ...props
}) => (
  <FlexBox alignItems="center" {...props}>
    <OasisIcon icon={icon} size="md" className={styles.icon} />
    <span className={styles.baseText}>
      {tokenAmount !== "N/A" ? (
        <span>
          <OasisSignificantDigitsWrapper
            fullPrecisionAmount={tokenAmountFullPrecision}
            amount={tokenAmount.toString()}
          />
        </span>
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
  icon: PropTypes.string,
  tokenAmountFullPrecision: PropTypes.string,
};

const TokenReceivedAmount = ({ tokenName, tokenAmount, ...props }) => (
  <TokenAmount
    tokenName={tokenName}
    tokenAmount={tokenAmount}
    icon="add"
    {...props}
  />
);

TokenReceivedAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string,
};

const TokenSoldAmount = ({ tokenName, tokenAmount, ...props }) => (
  <TokenAmount
    style={{width: '130px', display: 'inline-block'}}
    tokenName={tokenName}
    tokenAmount={tokenAmount}
    icon="subtract"
    {...props}
  />
);

TokenSoldAmount.propTypes = {
  tokenName: PropTypes.string,
  tokenAmount: PropTypes.string
};

const propTypes = PropTypes && {
  sellToken: PropTypes.string.isRequired,
  buyToken: PropTypes.string.isRequired,
  amountSold: PropTypes.string.isRequired,
  amountSoldFullPrecision: PropTypes.string,
  amountReceivedFullPrecision: PropTypes.string
};
const defaultProps = {};

export class OasisSoldReceivedAmounts extends PureComponent {
  render() {
    const {
      amountReceived,
      amountReceivedFullPrecision,
      amountSold,
      amountSoldFullPrecision,
      sellToken,
      buyToken,
      ...props
    } = this.props;
    return (
      <div {...props} className={styles.base}>
        <FlexBox inline className={styles.buying}>
          <TokenReceivedAmount
            tokenAmount={amountReceived}
            tokenAmountfullPrecision={amountReceivedFullPrecision}
            tokenName={buyToken}
            className={styles.detailsAmountCol}
          />
        </FlexBox>
        <FlexBox inline className={styles.selling}>
          <TokenSoldAmount
            tokenAmount={amountSold}
            tokenAmountFullPrecision={amountSoldFullPrecision}
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
