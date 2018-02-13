import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../store/reducers/offerTakes';
import offerTakes from '../store/selectors/offerTakes';
import tokens from '../store/selectors/tokens';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

const offerTypeLabel = (offerTakeType) => {
  switch (offerTakeType) {
    case TAKE_SELL_OFFER: return 'Sell';
    case TAKE_BUY_OFFER:  return 'Buy';
  }
};

export class OfferTakeAmountBelowLimitWrapper extends PureComponent {
  render() {
    const { isOfferBelowLimit = true, offerTakeType, offerTakeMinLimit, offerTakeBaseToken} = this.props;
    return isOfferBelowLimit ? (
      <div>
        Your {offerTypeLabel(offerTakeType)} order is below the
        <b>minimum of {offerTakeMinLimit}</b>
        <span>{offerTakeBaseToken}</span>
      </div>
    ): null;
  }
}

export function mapStateToProps(state) {
  return {
    offerTakeType: offerTakes.activeOfferTakeType(state),
    isOfferBelowLimit: offerTakes.isOfferBelowLimit(state),
    offerTakeBaseToken: tokens.activeTradingPairBaseToken(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OfferTakeAmountBelowLimitWrapper.propTypes = propTypes;
OfferTakeAmountBelowLimitWrapper.displayName = 'OfferTakeAmountBelowLimit';
export default connect(mapStateToProps, mapDispatchToProps)(OfferTakeAmountBelowLimitWrapper);
