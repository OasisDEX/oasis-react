import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import getUsersSoldAndReceivedAmounts from "../utils/offers/getUsersSoldAndReceivedAmounts";
import OasisOfferSummary from "../components/OasisOfferSummary";
import {
  gasEstimateInfo,
  getOfferBuyAndSellTokenByOfferType,
  getOfferFormValuesByOfferType,
  hasSufficientTokenAmountByOfferType
} from "../store/selectors";
import OasisInsufficientAmountOfToken from "../components/OasisInsufficientAmountOfToken";
import { TX_OFFER_TAKE } from "../store/reducers/transactions";
import offerTakes from "../store/selectors/offerTakes";
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from "../store/reducers/offerTakes";

const propTypes = PropTypes && {
  offerType: PropTypes.oneOf(TAKE_BUY_OFFER, TAKE_SELL_OFFER),
  offerFormValues: ImmutablePropTypes.map.isRequired,
  offerBuyAndSellTokens: ImmutablePropTypes.map.isRequired,
  gasEstimateInfo: ImmutablePropTypes.map.isRequired,
  hasSufficientTokenAmount: PropTypes.bool.isRequired,
  isTokenTradingEnabled: PropTypes.bool.isRequired,
  actions: PropTypes.object
};

export class OasisOfferSummaryWrapper extends PureComponent {
  render() {
    const {
      offerType,
      offerFormValues,
      offerBuyAndSellTokens,
      gasEstimateInfo,
      hasSufficientTokenAmount,
      isTokenTradingEnabled
    } = this.props;
    return hasSufficientTokenAmount ? (
      <OasisOfferSummary
        gasEstimateInfo={gasEstimateInfo}
        {...getUsersSoldAndReceivedAmounts(offerType, offerFormValues)}
        offerType={offerType}
        buyToken={offerBuyAndSellTokens.get("buyToken")}
        sellToken={offerBuyAndSellTokens.get("sellToken")}
        isTokenTradingEnabled={isTokenTradingEnabled}
        // getTransactionGasCostEstimate={getTransactionGasCostEstimate}
      />
    ) : (
      <OasisInsufficientAmountOfToken
        tokenName={offerBuyAndSellTokens.get("sellToken")}
      />
    );
  }
}

export function mapStateToProps(state, { offerType }) {
  return {
    offerFormValues: getOfferFormValuesByOfferType(state, offerType),
    offerBuyAndSellTokens: getOfferBuyAndSellTokenByOfferType(state, offerType),
    gasEstimateInfo: gasEstimateInfo(state, TX_OFFER_TAKE),
    hasSufficientTokenAmount: hasSufficientTokenAmountByOfferType(
      state,
      offerType
    ),
    isTokenTradingEnabled: offerTakes.getActiveOfferTakeAllowanceStatus(state)
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
