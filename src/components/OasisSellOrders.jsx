import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisTable from './OasisTable';
import { isOfferOwner, toDisplayFormat } from '../utils/orders';
import { LoadProgressSection } from '../utils/offers/loadProgress';
import { TAKE_SELL_OFFER } from '../store/reducers/offerTakes';
// import ImmutablePropTypes from 'react-immutable-proptypes';


const propTypes = PropTypes && {
  onSetOfferTakeModalOpen: PropTypes.func.isRequired,
  onSetActiveOfferTakeOfferId: PropTypes.func.isRequired,
  onCheckOfferIsActive: PropTypes.func.isRequired,
  onResetCompletedOfferCheck: PropTypes.func.isRequired,
};

const defaultProps = {};

const actionsColumnTemplate = function(offer) {
  return null;
  // const onCancel = () => this.cancelOffer(offer);
  // return (
  //   isOfferOwner(offer) ? (<button onClick={onCancel}>cancel</button>): null
  // );
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


  constructor(props) {
    super(props);
    this.onTableRowClick = this.onTableRowClick.bind(this);
  }

  onTableRowClick(rowData) {
    const { onSetOfferTakeModalOpen, onCheckOfferIsActive, onResetCompletedOfferCheck } = this.props;
    onCheckOfferIsActive(rowData.id)
      .then(
        isActive =>
          isActive === true ?
            onSetOfferTakeModalOpen({ offerTakeType: TAKE_SELL_OFFER, offerId: rowData.id }):
            onResetCompletedOfferCheck()
      );
  }

  render() {
    const { activeTradingPair: { baseToken, quoteToken }, sellOffers, sellOfferCount, cancelOffer } = this.props;
    const orderActions = { cancelOffer };
    return (
      <OasisWidgetFrame
        heading={`SELL ORDERS`}
        loadProgressSection={<LoadProgressSection loadedOffersList={sellOffers} offersTotalCount={sellOfferCount}/>}
      >
        <OasisTable
          onRowClick={this.onTableRowClick}
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
