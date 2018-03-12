import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisTable from './OasisTable';
import { isOfferOwner, toDisplayFormat } from '../utils/orders';
import { LoadProgressSection } from '../utils/offers/loadProgress';
import { TAKE_BUY_OFFER } from '../store/reducers/offerTakes';

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
  //   isOfferOwner(offer) ? (<button onClick={onCancel}>cancel</button>) : null
  // );
};

const colsDefinition = (baseToken, quoteToken, orderActions) => {
  return [
    { heading: `price`, key: 'bid_price' },
    { heading: `${quoteToken}`, key: 'sell_how_much' },
    { heading: `${baseToken}`, key: 'buy_how_much' },
    { heading: ``, template: actionsColumnTemplate.bind(orderActions) },
  ];
};

class OasisBuyOrders extends PureComponent {

  constructor(props) {
    super(props);
    this.onTableRowClick = this.onTableRowClick.bind(this);
  }

  onTableRowClick(rowData) {

    const { onSetOfferTakeModalOpen, onCheckOfferIsActive, onResetOfferTake } = this.props;
    onCheckOfferIsActive(rowData.id)
      .then(
        isActive =>
          isActive === true ?
            onSetOfferTakeModalOpen({ offerTakeType: TAKE_BUY_OFFER, offerId: rowData.id }) :
            onResetOfferTake()
      );
  }

  render() {
    const { activeTradingPair: { baseToken, quoteToken }, buyOffers = [], buyOfferCount, cancelOffer } = this.props;
    const orderActions = { cancelOffer };
    return (
      <OasisWidgetFrame
        heading={`BUY ORDERS`}
        loadProgressSection={
          <LoadProgressSection loadedOffersList={buyOffers} offersTotalCount={buyOfferCount}/>
        }
      >
        <OasisTable
          onRowClick={this.onTableRowClick}
          rows={buyOffers.sort((p, c) => p.bid_price_sort < c.bid_price_sort ? 1 : -1).map(toDisplayFormat)}
          col={colsDefinition(baseToken, quoteToken, orderActions)}
        />
      </OasisWidgetFrame>
    );
  }
}

OasisBuyOrders.displayName = 'OasisBuyOrders';
OasisBuyOrders.propTypes = propTypes;
OasisBuyOrders.defaultProps = defaultProps;
export default OasisBuyOrders;
