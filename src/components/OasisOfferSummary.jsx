import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";

import styles from "./OasisOfferSummary.scss";
import OasisGasPriceWrapper from "../containers/OasisGasPrice";
import CSSModules from "react-css-modules/dist/index";
import OasisSoldReceivedAmounts from "./OasisSoldReceivedAmounts";
import OasisIsTokenTradingEnabledByUserWrapper from "../containers/OasisIsTokenTradingEnabledByUser";
import InfoBox from "./InfoBox";
import InfoBoxBody from "./InfoBoxBody";
import FlexBox from "./FlexBox";
// import tokenToBeAllowedForOffer from "../utils/offers/tokenToBeAllowedForOffer";
// import { isVolumeOrPriceEmptyOrZero } from '../store/selectors';

const propTypes = PropTypes && {
  offerType: PropTypes.string.isRequired,
  sellToken: PropTypes.string.isRequired,
  buyToken: PropTypes.string.isRequired,
  amountSold: PropTypes.string.isRequired,
  amountReceived: PropTypes.string.isRequired,
  gasEstimateInfo: ImmutablePropTypes.map.isRequired,
  isTokenTradingEnabled: PropTypes.bool.isRequired,
  isVolumeOrPriceEmptyOrZero: PropTypes.bool
};
const defaultProps = {
};

export class OasisOfferSummary extends PureComponent {
  renderGasEstimate() {
    const { gasEstimateInfo, isVolumeOrPriceEmptyOrZero } = this.props;
    if (isVolumeOrPriceEmptyOrZero) {
      return (null);
    } else {
      const gasEstimatePending = gasEstimateInfo.get("isGasEstimatePending");
      const transactionGasCostEstimate = gasEstimateInfo.get(
        "transactionGasCostEstimate"
      );
      const gasEstimateError = gasEstimateInfo.get("transactionGasCostEstimateError");
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
    return (<div>Enable trading to unlock gas est.</div>);
  }

  render() {
    const {
      sellToken,
      buyToken,
      amountSold,
      amountReceived,
      // offerType,
      isTokenTradingEnabled
    } = this.props;

    return (
      <div className={styles.base}>
        <InfoBox vertical>
          <InfoBoxBody>
            <FlexBox>
              <OasisSoldReceivedAmounts
                sellToken={sellToken}
                buyToken={buyToken}
                amountSold={amountSold}
                amountReceived={amountReceived}
              />
              <div>
                <OasisIsTokenTradingEnabledByUserWrapper
                  tokenName={sellToken}
                />
                {isTokenTradingEnabled
                  ? this.renderGasEstimate()
                  : OasisOfferSummary.renderGasEstimateNotEnabledInfo()}
              </div>
            </FlexBox>
          </InfoBoxBody>
        </InfoBox>
      </div>
    );
  }
}

OasisOfferSummary.displayName = "OasisOfferSummary";
OasisOfferSummary.propTypes = propTypes;
OasisOfferSummary.defaultProps = defaultProps;
export default CSSModules(OasisOfferSummary, styles);
