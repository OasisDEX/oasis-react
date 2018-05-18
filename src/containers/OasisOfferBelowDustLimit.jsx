import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import InfoBoxWithIco from "../components/InfoBoxWithIco";
import offerMakes from "../store/selectors/offerMakes";
import limits from '../store/selectors/limits';
import tokens from '../store/selectors/tokens';
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../constants';
import { formatAmount } from '../utils/tokens/pair';

const propTypes = PropTypes && {
  actions: PropTypes.object,
  offerType: PropTypes.string.isRequired
};

const offerTypeLabel = offerTakeType => {
  switch (offerTakeType) {
    case MAKE_BUY_OFFER:
      return "sell";
    case MAKE_SELL_OFFER:
      return "buy";
  }
};

export class OasisOfferBelowDustLimitWrapper extends PureComponent {
  render() {
    const { isOfferBelowLimit, offerType, tokenName, tokenMinLimit } = this.props;
    return (
      <div hidden={!isOfferBelowLimit}>
        <InfoBoxWithIco fullWidth icon="warning" color="danger">
          You are trying to create a <b>{offerTypeLabel(offerType)}</b>
          order
          below the minimum <b>market limit</b>, which is <b>{formatAmount(tokenMinLimit, false, null, 5)} {tokenName}</b>.
        </InfoBoxWithIco>
      </div>
    );
  }
}

export function mapStateToProps(state, { offerType }) {
  return {
    tokenName: tokens.activeTradingPairQuoteToken(state),
    isOfferBelowLimit: offerMakes.isOfferBelowLimit(state, offerType),
    tokenMinLimit: limits.quoteTokenMinSellLimitInEther(state),
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
