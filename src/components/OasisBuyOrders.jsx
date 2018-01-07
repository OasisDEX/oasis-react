import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisTable from './OasisTable';
import { toDisplayFormat } from '../utils/orders';

const propTypes = PropTypes && {};
const defaultProps = {};


const colsDefinition = (baseToken, quoteToken) => {
  return [
    { heading: `price`, key: 'bid_price' },
    { heading: `${quoteToken}`, key: 'sell_how_much' },
    { heading: `${baseToken}`, key: 'buy_how_much' },
  ];
};


class OasisBuyOrders extends PureComponent {
  render() {
    const { activeTradingPair: { baseToken, quoteToken }, buyOffers = [] } = this.props;
    return (
      <OasisWidgetFrame heading={'BUY ORDERS'}>
        <OasisTable rows={buyOffers.map(toDisplayFormat)} col={colsDefinition(baseToken, quoteToken)}/>
      </OasisWidgetFrame>
    );
  }
}

OasisBuyOrders.displayName = 'OasisBuyOrders';
OasisBuyOrders.propTypes = propTypes;
OasisBuyOrders.defaultProps = defaultProps;
export default OasisBuyOrders;
