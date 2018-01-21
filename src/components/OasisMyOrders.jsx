import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import BigNumber from  'bignumber.js';
import ImmutablePropTypes from 'react-immutable-proptypes';
import moment from 'moment';

import styles from './OasisMyOrders.scss';
import { DESCENDING, orderByTimestamp } from '../utils/sort';
import { formatAmount, formatPrice, formatTradeType, price, tradeType } from '../utils/tokens/pair';
import { OasisTable } from './OasisTable';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import web3 from '../bootstrap/web3';
import { ASK, BID } from '../store/reducers/trades';
import { ETH_UNIT_ETHER } from '../constants';
import { isOfferOwner } from '../utils/orders';



const myOrdersDisplayFormat = offer => {

  let baseAmount = null, quoteAmount = null;
  switch (offer.tradeType) {
    case 'buy':
      baseAmount = formatAmount(offer.buyHowMuch, true,  ETH_UNIT_ETHER);
      quoteAmount = formatAmount(offer.sellHowMuch, true, ETH_UNIT_ETHER);
    break;
    case 'sell':
      baseAmount = formatAmount(offer.sellHowMuch, true,  ETH_UNIT_ETHER);
      quoteAmount = formatAmount(offer.buyHowMuch, true, ETH_UNIT_ETHER);
    break;
  }

  return ({
    tradeType: offer.tradeType,
    price: formatPrice(offer.price),
    baseAmount,
    quoteAmount,
    owner: offer.owner,
    id: offer.id
  });
};

const myOffersFilter = ({owner}) => {
  const myAccountAddress = web3.eth.defaultAccount;
  return (owner === myAccountAddress);
};

const actionsColumnTemplate = function(offer) {
  const onCancel = () => {
    this.cancelOffer(offer);
  };
  return (
    isOfferOwner(offer) ? (<button onClick={onCancel}>cancel</button>): null
  );
};

const tradesHistoryColsDefinition = (baseToken, quoteToken) => [
    { heading: 'date', key: 'date' },
    { heading: 'action', key: 'tradeType' },
    { heading: `price`, key: 'price' },
    { heading: `${quoteToken}`, key: 'quoteAmount' },
    { heading: `${baseToken}`, key: 'baseAmount' },
];


const openOrdersColsDefinition = (baseToken, quoteToken, orderActions) => [
  { heading: 'action', key: 'tradeType' },
  { heading: `price`, key: 'price' },
  { heading: `${quoteToken}`, key: 'quoteAmount' },
  { heading: `${baseToken}`, key: 'baseAmount' },
  { heading: ``, template: actionsColumnTemplate.bind(orderActions)}
];

const propTypes = PropTypes && {
  trades: ImmutablePropTypes.list
};
const defaultProps = {};



class OasisMyOrders extends PureComponent {

  constructor(props) {
    super(props);
    this.viewType = 'Open';
    this.onViewTypeChange = this.onViewTypeChange.bind(this);
  }

  onViewTypeChange(ev) {
    this.viewType = ev.target.value;
    this.forceUpdate();
  }

  renderOpenOffers() {
    const { activeTradingPair: { baseToken, quoteToken }, sellOffers = [], buyOffers = [], cancelOffer } = this.props;
    const orderActions = { cancelOffer };
    const myOpenOffers =
      sellOffers
        .map(so => ({...so, tradeType: formatTradeType(ASK), price: so.ask_price }) )
        .concat(buyOffers.map(bo => ({...bo, tradeType: formatTradeType(BID), price: bo.bid_price }) ))
        .filter(myOffersFilter)
        .sort((p, c) => p.bid_price_sort < c.bid_price_sort ? 1 : -1)
        .map(myOrdersDisplayFormat);

    if(myOpenOffers.count()) {
      return (
        <OasisTable
          rows={myOpenOffers.toArray()}
          col={openOrdersColsDefinition(baseToken, quoteToken, orderActions)}
        />
      );
    } else {
      return (
        <div>You currently have no active offers</div>
      )
    }


  }

  renderTradesHistory() {

    const toHistoricalTrades = (tradeHistoryEntry) => {
      let baseAmount = null, quoteAmount = null;

      if (tradeHistoryEntry.buyWhichToken === quoteToken && tradeHistoryEntry.sellWhichToken === baseToken) {
        baseAmount = new BigNumber(tradeHistoryEntry.sellHowMuch);
        quoteAmount = new BigNumber(tradeHistoryEntry.buyHowMuch);
      } else if (tradeHistoryEntry.buyWhichToken === baseToken && tradeHistoryEntry.sellWhichToken === quoteToken) {
        baseAmount = new BigNumber(tradeHistoryEntry.buyHowMuch);
        quoteAmount = new BigNumber(tradeHistoryEntry.sellHowMuch);
      }

      return {
        date: moment.unix(tradeHistoryEntry.timestamp).format('DD-MM-HH:mm'),
        tradeType: formatTradeType(
          tradeType(tradeHistoryEntry, baseToken),
        ),
        baseAmount: formatAmount(baseAmount, true),
        quoteAmount: formatAmount(quoteAmount, true),
        price: formatPrice(
          price(tradeHistoryEntry, baseToken, quoteToken),
        ),
      };
    };
    const { trades, activeTradingPair: { baseToken, quoteToken } } = this.props;
    const myTrades = trades.filter(myOffersFilter);
    const marketHistory = orderByTimestamp(myTrades.toJSON(), DESCENDING).map(toHistoricalTrades);
    if (myTrades.count()) {
      return (
        <OasisTable rows={marketHistory} col={tradesHistoryColsDefinition(baseToken, quoteToken)}/>
      );
    } else {
      return (<div>Your trades is history empty</div>);
    }

  }

  renderContent() {
    switch (this.viewType) {
      case 'Open': return this.renderOpenOffers();
      case 'Closed': return this.renderTradesHistory();
    }
  }


  render() {

    return (
      <OasisWidgetFrame heading={'MY ORDERS'}>
        <div>
          <select onChange={this.onViewTypeChange} value={this.viewType} >
            <option value={'Open'}>Open</option>
            <option value={'Closed'}>Closed</option>
          </select>
        </div>
        <div>{this.renderContent()}</div>
      </OasisWidgetFrame>
    );
  }
}

OasisMyOrders.displayName = 'OasisMyOrders';
OasisMyOrders.propTypes = propTypes;
OasisMyOrders.defaultProps = defaultProps;
export default OasisMyOrders;
