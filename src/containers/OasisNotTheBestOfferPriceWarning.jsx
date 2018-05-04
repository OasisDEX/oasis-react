import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import InfoBox from '../components/InfoBox';
import InfoBoxBody from '../components/InfoBoxBody';
import offerTakes from '../store/selectors/offerTakes';
import offers from '../store/selectors/offers';

const propTypes = PropTypes && {

};

export class OasisNotTheBestOfferPriceWarningWrapper extends PureComponent {
  render() {
    const { isBestOffer } = this.props;
    return !isBestOffer ? (
      <InfoBox color="danger">
        <InfoBoxBody>
          WARNING: You have not chosen the best price available. Review the order book to find a better trade.
        </InfoBoxBody>
      </InfoBox>
    ) : null;
  }
}

export function mapStateToProps(state) {
  return {
    bestBuyOfferId: offers.activeTradingPairBestBuyOfferId(state),
    bestSellOfferId: offers.activeTradingPairBestSellOfferId(state),
    isBestOffer: offerTakes.isActiveOfferTakeBestOffer(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisNotTheBestOfferPriceWarningWrapper.propTypes = propTypes;
OasisNotTheBestOfferPriceWarningWrapper.displayName = 'OasisNotTheBestOfferPriceWarning';
export default connect(mapStateToProps, mapDispatchToProps)(OasisNotTheBestOfferPriceWarningWrapper);
