import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisTable from './OasisTable';
import { formatPrice } from '../utils/tokens/pair';
import { ETH_UNIT_ETHER } from '../constants';
import { isOfferOwner, toDisplayFormat } from '../utils/orders';
// import ImmutablePropTypes from 'react-immutable-proptypes';


const propTypes = PropTypes && {};
const defaultProps = {};

const actionsColumnTemplate = function(offer) {
  const onCancel = () => this.cancelOffer(offer);
  return (
    isOfferOwner(offer) ? (<button onClick={onCancel}>cancel</button>): null
  );
};


const colsDefinition = (baseToken, quoteToken, orderActions) => {
  return [
    { heading: `price`, key: 'ask_price' },
    { heading: `${quoteToken}`, key: 'buy_how_much' }, // how much will pay
    { heading: `${baseToken}`, key: 'sell_how_much' },// how much  will get
    { heading: ``, template: actionsColumnTemplate.bind(orderActions)},
  ];
};


class OasisSellOrders extends PureComponent {
  render() {
    const { activeTradingPair: { baseToken, quoteToken }, sellOffers, cancelOffer } = this.props;
    const orderActions = { cancelOffer };
    return (
      <OasisWidgetFrame heading={'SELL ORDERS'}>
        <OasisTable
          rows={sellOffers.sort((p, c) => p.ask_price_sort > c.ask_price_sort? 1 : -1).map(toDisplayFormat)}
          col={colsDefinition(baseToken, quoteToken, orderActions)}/>
      </OasisWidgetFrame>
    );
  }
}

OasisSellOrders.displayName = 'OasisSellOrders';
OasisSellOrders.propTypes = propTypes;
OasisSellOrders.defaultProps = defaultProps;
export default OasisSellOrders;
