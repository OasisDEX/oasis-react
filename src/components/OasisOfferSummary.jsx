import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";

import styles from "./OasisOfferSummary.scss";
import OasisGasPriceWrapper from "../containers/OasisGasPrice";
import CSSModules from "react-css-modules/dist/index";
import OasisSoldReceivedAmounts from "./OasisSoldReceivedAmounts";
import OasisIsTokenTradingEnabledByUserWrapper from "../containers/OasisIsTokenTradingEnabledByUser";
import InfoBox from "./InfoBox";
import OasisIcon from "./OasisIcon";

const propTypes = {
  offerType: PropTypes.string.isRequired,
  sellToken: PropTypes.string.isRequired,
  buyToken: PropTypes.string.isRequired,
  amountSold: PropTypes.string.isRequired,
  amountReceived: PropTypes.string.isRequired,
  gasEstimateInfo: ImmutablePropTypes.map.isRequired,
  isTokenTradingEnabled: PropTypes.bool.isRequired,
  isVolumeOrPriceEmptyOrZero: PropTypes.bool,
  contractsLoaded: PropTypes.bool
};
const defaultProps = {};

export class OasisOfferSummary extends PureComponent {
  renderGasEstimate() {
    const { gasEstimateInfo, isVolumeOrPriceEmptyOrZero } = this.props;
    if (isVolumeOrPriceEmptyOrZero) {
      return (
        <OasisGasPriceWrapper
          gasEstimateError={null}
          gasEstimatePending={false}
          transactionGasCostEstimate={"0"}
          className={styles.detailsTradingCol}
        />
      );
    } else {
      const gasEstimatePending = gasEstimateInfo.get("isGasEstimatePending");
      const transactionGasCostEstimate = gasEstimateInfo.get(
        "transactionGasCostEstimate"
      );
      const gasEstimateError = gasEstimateInfo.get(
        "transactionGasCostEstimateError"
      );
      return (
        <OasisGasPriceWrapper
          gasEstimateError={gasEstimateError}
          gasEstimatePending={gasEstimatePending}
          transactionGasCostEstimate={transactionGasCostEstimate}
          className={styles.detailsTradingCol}
        />
      );
    }
  }

  static renderGasEstimateNotEnabledInfo() {
    return <div>Enable trading to unlock gas est.</div>;
  }

  renderIsTokenEnabledSection() {
    const { sellToken, contractsLoaded } = this.props;
    return contractsLoaded ? (
      <OasisIsTokenTradingEnabledByUserWrapper tokenName={sellToken} />
    ) : (
      <div style={{ marginBottom: "4px" }}>
        <OasisIcon icon="loading" />
        <span style={{ marginLeft: "5px", display: "inline-block" }}>
          Loading market contracts...
        </span>
      </div>
    );
  }
  render() {
    const {
      sellToken,
      buyToken,
      amountSold,
      amountReceived,
      isTokenTradingEnabled
    } = this.props;

    return (
      <div className={styles.base}>
        <InfoBox wrapXXS>
          <OasisSoldReceivedAmounts
            sellToken={sellToken}
            buyToken={buyToken}
            amountSold={amountSold}
            amountReceived={amountReceived}
            className={styles.detailsAmountCol}
          />

          <div className={styles.detailsTradingCol}>
            {this.renderIsTokenEnabledSection()}
            {isTokenTradingEnabled
              ? this.renderGasEstimate()
              : OasisOfferSummary.renderGasEstimateNotEnabledInfo()}
          </div>
        </InfoBox>
      </div>
    );
  }
}

OasisOfferSummary.displayName = "OasisOfferSummary";
OasisOfferSummary.propTypes = propTypes;
OasisOfferSummary.defaultProps = defaultProps;
export default CSSModules(OasisOfferSummary, styles);
