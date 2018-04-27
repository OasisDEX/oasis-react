import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import getUsersSoldAndReceivedAmounts from "../utils/offers/getUsersSoldAndReceivedAmounts";
import OasisOfferSummary from "../components/OasisOfferSummary";
import {
  gasEstimateInfo,
  getOfferBuyAndSellTokenByOfferType,
  getOfferFormValuesByOfferType, hasSufficientTokenAmountByOfferType,
} from '../store/selectors';
import OasisInsufficientAmountOfToken from '../components/OasisInsufficientAmountOfToken';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisOfferSummaryWrapper extends PureComponent {
  render() {
    const {
      offerType,
      offerFormValues,
      offerBuyAndSellTokens,
      gasEstimateInfo,
      hasSufficientTokenAmount
    } = this.props;
    // console.log(this.props)
    return hasSufficientTokenAmount ? (
      <OasisOfferSummary
        gasEstimateInfo={gasEstimateInfo}
        {...getUsersSoldAndReceivedAmounts(offerType, offerFormValues)}
        offerType={offerType}
        buyToken={offerBuyAndSellTokens.get("buyToken")}
        sellToken={offerBuyAndSellTokens.get("sellToken")}
        // getTransactionGasCostEstimate={getTransactionGasCostEstimate}
      />
    ) : <OasisInsufficientAmountOfToken tokenName={offerBuyAndSellTokens.get("sellToken")}/>;
  }
}

export function mapStateToProps(state, { offerType }) {
  return {
    offerFormValues: getOfferFormValuesByOfferType(state, offerType),
    offerBuyAndSellTokens: getOfferBuyAndSellTokenByOfferType(state, offerType),
    gasEstimateInfo: gasEstimateInfo(state, offerType),
    hasSufficientTokenAmount: hasSufficientTokenAmountByOfferType(state, offerType)
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
