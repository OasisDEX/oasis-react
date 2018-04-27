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

const propTypes = PropTypes && {
  sellToken: PropTypes.string.isRequired,
  buyToken: PropTypes.string.isRequired,
  amountSold: PropTypes.string.isRequired,
  amountReceived: PropTypes.string.isRequired,
  gasEstimateInfo: ImmutablePropTypes.map.isRequired
};
const defaultProps = {};

export class OasisOfferSummary extends PureComponent {
  renderGasEstimate() {
    const {
      gasEstimateInfo,
      transactionGasCostEstimate,
      isGasEstimatePending,
      gasEstimateError
    } = this.props;

    console.log(gasEstimateInfo);
    if (isGasEstimatePending || transactionGasCostEstimate) {
      return (
        <OasisGasPriceWrapper
          gasEstimateError={gasEstimateError}
          gasEstimatePending={isGasEstimatePending}
          transactionGasCostEstimate={transactionGasCostEstimate}
          className={styles.detailsTradingCol}
        />
      );
    } else {
      return null;
    }
  }

  render() {
    const { sellToken, buyToken, amountSold, amountReceived } = this.props;
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
                {this.renderGasEstimate()}
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
