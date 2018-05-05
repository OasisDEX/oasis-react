import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import getUsersSoldAndReceivedAmounts from "../utils/offers/getUsersSoldAndReceivedAmounts";
import OasisOfferSummary from "../components/OasisOfferSummary";
import {
  gasEstimateInfo, getActiveOfferAllowanceStatus,
  getOfferBuyAndSellTokenByOfferType,
  getOfferFormValuesByOfferType,
  hasSufficientTokenAmountByOfferType,
} from '../store/selectors';
import OasisInsufficientAmountOfToken from "../components/OasisInsufficientAmountOfToken";
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from "../store/reducers/offerTakes";
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from "../constants";

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
  sellToken: PropTypes.string
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
    gasEstimateInfo: gasEstimateInfo(state, offerType),
    hasSufficientTokenAmount: hasSufficientTokenAmountByOfferType(
      state,
      offerType
    ),
    isTokenTradingEnabled: getActiveOfferAllowanceStatus(
      state,
      offerType
    )
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
