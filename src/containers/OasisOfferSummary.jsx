import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import getUsersSoldAndReceivedAmounts from "../utils/offers/getUsersSoldAndReceivedAmounts";
import OasisOfferSummary from "../components/OasisOfferSummary";
import {
  gasEstimateInfo,
  getActiveOfferAllowanceStatus,
  getOfferBuyAndSellTokenByOfferType,
  getOfferFormValuesByOfferType,
  hasSufficientTokenAmountByOfferType
} from "../store/selectors";
import OasisInsufficientAmountOfToken from "../components/OasisInsufficientAmountOfToken";
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from "../store/reducers/offerTakes";
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from "../constants";
import isVolumeOrPriceEmptyOrZero from "../store/selectors/isVolumeOrPriceEmptyOrZero";
import OasisOrderExceedsGasLimitInfoWrapper from "./OasisOrderExceedsGasLimitInfo";
import platform from "../store/selectors/platform";

const propTypes = PropTypes && {
  offerType: PropTypes.oneOf([
    TAKE_BUY_OFFER,
    MAKE_BUY_OFFER,
    TAKE_SELL_OFFER,
    MAKE_SELL_OFFER
  ]),
  offerFormValues: ImmutablePropTypes.map.isRequired,
  offerBuyAndSellTokens: ImmutablePropTypes.map.isRequired,
  gasEstimateInfo: ImmutablePropTypes.map.isRequired,
  hasSufficientTokenAmount: PropTypes.bool.isRequired,
  isTokenTradingEnabled: PropTypes.bool.isRequired,
  actions: PropTypes.object,
  buyToken: PropTypes.string,
  sellToken: PropTypes.string,
  disableBalanceWarning: PropTypes.bool,
  contractsLoaded: PropTypes.bool
};

export class OasisOfferSummaryWrapper extends PureComponent {
  renderOfferSummary() {
    const {
      offerType,
      offerFormValues,
      offerBuyAndSellTokens,
      gasEstimateInfo,
      hasSufficientTokenAmount,
      isTokenTradingEnabled,
      isVolumeOrPriceEmptyOrZero,
      disableBalanceWarning,
      contractsLoaded
    } = this.props;

    return (hasSufficientTokenAmount || disableBalanceWarning) ? (
      <div>
        {gasEstimateInfo && (
          <OasisOrderExceedsGasLimitInfoWrapper
            gasEstimateInfo={gasEstimateInfo}
            onTransactionGasLimitExceeded={() => {}}
            onTransactionGasBelowLimit={() => {}}
          />
        )}
        <OasisOfferSummary
          contractsLoaded={contractsLoaded}
          isVolumeOrPriceEmptyOrZero={isVolumeOrPriceEmptyOrZero}
          gasEstimateInfo={gasEstimateInfo}
          {...getUsersSoldAndReceivedAmounts(offerType, offerFormValues)}
          offerType={offerType}
          buyToken={offerBuyAndSellTokens.get("buyToken")}
          sellToken={offerBuyAndSellTokens.get("sellToken")}
          isTokenTradingEnabled={isTokenTradingEnabled}
        />
      </div>
    ) : null;
  }
  render() {
    const {
      offerBuyAndSellTokens,
      hasSufficientTokenAmount,
      disableBalanceWarning
    } = this.props;
    return (
      <div>
        {this.renderOfferSummary()}
        {!hasSufficientTokenAmount &&
          !disableBalanceWarning && (
            <OasisInsufficientAmountOfToken
              tokenName={offerBuyAndSellTokens.get("sellToken")}
            />
          )}
      </div>
    );
  }
}

export function mapStateToProps(state, { offerType }) {
  return {
    contractsLoaded: platform.contractsLoaded(state),
    offerFormValues: getOfferFormValuesByOfferType(state, offerType),
    offerBuyAndSellTokens: getOfferBuyAndSellTokenByOfferType(state, offerType),
    gasEstimateInfo: gasEstimateInfo(state, offerType),
    hasSufficientTokenAmount: hasSufficientTokenAmountByOfferType(
      state,
      offerType
    ),
    isVolumeOrPriceEmptyOrZero: isVolumeOrPriceEmptyOrZero(state)(offerType),
    isTokenTradingEnabled: getActiveOfferAllowanceStatus(state, offerType)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisOfferSummaryWrapper.propTypes = propTypes;
OasisOfferSummaryWrapper.displayName = "OasisOfferSummary";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisOfferSummaryWrapper
);
