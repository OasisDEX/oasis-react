import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import InfoBox from '../components/InfoBox';
import InfoBoxBody from '../components/InfoBoxBody';
import offerTakes from '../store/selectors/offerTakes';
import offers from '../store/selectors/offers';
import OasisIcon from '../components/OasisIcon';

const propTypes = PropTypes && {

};

export class OasisNotTheBestOfferPriceWarningWrapper extends PureComponent {
  render() {
    const { isBestOffer } = this.props;
    return !isBestOffer ? (
      <InfoBox color="danger">
        <InfoBoxBody>
          <div style={{ width: '10%', display:'inline-block' }}>
            <OasisIcon icon="warning"/>
          </div>
          <div style={{ width:'90%', display:'inline-block' }}>
            WARNING: You have not chosen the best price available. Review the order book to find a better trade.
          </div>
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
