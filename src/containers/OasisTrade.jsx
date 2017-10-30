import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OasisMarket from '../components/OasisMarket';
import OasisChart from '../components/OasisChart';

import {OasisTradeBuySellWrapper} from './OasisTradeBuySell';
import {OasisTradeOrdersWrapper} from './OasisTradeOrders';

const propTypes = PropTypes && {
  actions: PropTypes.object
};

export class OasisTradeWrapper extends PureComponent {
  render() {
    return (
      <div>Trade
        <OasisMarket/>
        <OasisChart/>
        <OasisTradeBuySellWrapper/>
        <OasisTradeOrdersWrapper/>
      </div>
    );
  }
}

export function mapStateToProps() {
  return {};
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeWrapper.propTypes = propTypes;
OasisTradeWrapper.displayName = 'OasisTrade';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeWrapper);
