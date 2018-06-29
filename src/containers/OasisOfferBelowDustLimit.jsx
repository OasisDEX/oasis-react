import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import offerMakes from "../store/selectors/offerMakes";
import limits from "../store/selectors/limits";
import { formatAmount } from "../utils/tokens/pair";
import InfoBox from "../components/InfoBox";
import OasisIcon from "../components/OasisIcon";

const propTypes = PropTypes && {
  actions: PropTypes.object,
  offerType: PropTypes.string.isRequired
};

const amountAndTokenNameStyle = {
  marginLeft: 5,
  marginRight: 5,
  textDecoration: "underline"
};

export class OasisOfferBelowDustLimitWrapper extends PureComponent {
  render() {
    const {
      isOfferBelowLimit,
      tokenName,
      tokenMinLimit,
      noBorder
    } = this.props;
    return isOfferBelowLimit ? (
      <InfoBox fullWidth icon="warning" noBorder={noBorder} color="danger">
        <OasisIcon icon="warning" />
        <div style={{ marginLeft: 10, lineHeight: "24px" }}>
          Order below{" "}
          <b style={amountAndTokenNameStyle}>
            {formatAmount(tokenMinLimit, false, null, 5)} {tokenName}
          </b>{" "}
          limit.
        </div>
      </InfoBox>
    ) : null;
  }
}

export function mapStateToProps(state, { offerType, tokenName }) {
  return {
    isOfferBelowLimit: offerMakes.isOfferBelowLimit(state, offerType)(offerType),
    tokenMinLimit: limits.tokenMinSellLimitInEther(state)(tokenName)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisOfferBelowDustLimitWrapper.propTypes = propTypes;
OasisOfferBelowDustLimitWrapper.displayName = "OasisOfferBelowDustLimit";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisOfferBelowDustLimitWrapper
);
