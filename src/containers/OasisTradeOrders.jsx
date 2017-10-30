import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import OasisBuyOrders from '../components/OasisBuyOrders';
import OasisSellOrders from '../components/OasisSellOrders';
import OasisMyOrders from '../components/OasisMyOrders';
import OasisMarketHistory from '../components/OasisMarketHistory';

const propTypes = PropTypes && {
  actions: PropTypes.object
};

export class OasisTradeOrdersWrapper extends PureComponent {
  render() {
    return (
      <div>
        <OasisBuyOrders/>
        <OasisSellOrders/>
        <OasisMyOrders/>
        <OasisMarketHistory/>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {};
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeOrdersWrapper.propTypes = propTypes;
OasisTradeOrdersWrapper.displayName = 'OasisTradeOrders';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeOrdersWrapper);
