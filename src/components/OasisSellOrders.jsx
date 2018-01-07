import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisTable from './OasisTable';
import { formatPrice } from '../utils/tokens/pair';
import { ETH_UNIT_ETHER } from '../constants';
import { toDisplayFormat } from '../utils/orders';
// import ImmutablePropTypes from 'react-immutable-proptypes';


const propTypes = PropTypes && {};
const defaultProps = {};

const colsDefinition = (baseToken, quoteToken) => {
  return [
    { heading: `price`, key: 'ask_price' },
    { heading: `${quoteToken}`, key: 'buy_how_much' }, // how much will pay
    { heading: `${baseToken}`, key: 'sell_how_much' },// how much  will get
  ];
};


class OasisSellOrders extends PureComponent {
  render() {
    const { activeTradingPair: { baseToken, quoteToken }, sellOffers } = this.props;
    return (
      <OasisWidgetFrame heading={'SELL ORDERS'}>
        <OasisTable rows={sellOffers.map(toDisplayFormat)} col={colsDefinition(baseToken, quoteToken)}/>
      </OasisWidgetFrame>
    );
  }
}

OasisSellOrders.displayName = 'OasisSellOrders';
OasisSellOrders.propTypes = propTypes;
OasisSellOrders.defaultProps = defaultProps;
export default OasisSellOrders;
