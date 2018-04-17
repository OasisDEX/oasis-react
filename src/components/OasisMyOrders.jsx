import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import BigNumber from  'bignumber.js';
import ImmutablePropTypes from 'react-immutable-proptypes';
import moment from 'moment';

import { DESCENDING, orderByTimestamp } from '../utils/sort';
import { formatAmount, formatPrice, price } from '../utils/tokens/pair';
import { OasisTable } from './OasisTable';
import { OasisTradeType } from './OasisTradeType';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import web3 from '../bootstrap/web3';
import { ASK, BID } from '../store/reducers/trades';
import { ETH_UNIT_ETHER } from '../constants';
import { isOfferOwner } from '../utils/orders';
import OasisSelect from "./OasisSelect";
import styles from './OasisMyOrders.scss';
import OasisButton from "./OasisButton";



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


const myOpenOffersFilter = (entry) => {
  const myAccountAddress = web3.eth.defaultAccount;
  return (entry.owner.toString() === myAccountAddress.toString());
};

const myOffersFilter = (entry) => {
  const myAccountAddress = web3.eth.defaultAccount;
  const isOfferMaker = (entry.maker.toString() === myAccountAddress.toString());
  const isOfferTaker = (entry.taker.toString() === myAccountAddress.toString());
  return isOfferMaker || isOfferTaker;
};

const actionsColumnTemplate = function(offer) {
  let cancelPending = false;
  const onCancel = () => {
    this.cancelOffer(offer);
    cancelPending = true;
  };
  return (
    isOfferOwner(offer) ?
      (
        <OasisButton
            disabled={cancelPending}
            size='xs'
            onClick={onCancel}
            className={styles.cancelButton}
        >
          {cancelPending ? '...' : 'cancel'}
        </OasisButton>
      ) : null
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
        .map(so => ({...so, tradeType: <OasisTradeType type={ASK} />, price: so.ask_price }) )
        .concat(buyOffers.map(bo => ({...bo, tradeType: <OasisTradeType type={BID} />, price: bo.bid_price }) ))
        .filter(myOpenOffersFilter)
        .sort((p, c) => p.bid_price_sort < c.bid_price_sort ? 1 : -1)
        .map(myOrdersDisplayFormat);

    if(myOpenOffers.count()) {
      return (
        <OasisTable
          rows={myOpenOffers.toArray()}
          col={openOrdersColsDefinition(baseToken, quoteToken, orderActions)}
          className={styles.openOffers}
        />
      );
    } else {
      return (
        <div className={styles.info}>You currently have no active offers</div>
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
        tradeType: <OasisTradeType order={tradeHistoryEntry} baseCurrency={baseToken}/>,
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
        <OasisTable
          rows={marketHistory}
          col={tradesHistoryColsDefinition(baseToken, quoteToken)}
          className={styles.tradesHistory}/>
      );
    } else {
      return (<div className={styles.info}>Your trades history is empty</div>);
    }

  }

  renderContent() {
    switch (this.viewType) {
      case 'Open': return this.renderOpenOffers();
      case 'Closed': return this.renderTradesHistory();
    }
  }


  render() {
    var select = <OasisSelect
        onChange={this.onViewTypeChange}
        value={this.viewType}
        className={styles.select}
      >
        <option value={'Open'}>Open</option>
        <option value={'Closed'}>Closed</option>
      </OasisSelect>;

    return (
      <OasisWidgetFrame heading={'MY ORDERS'} headingChildren={select}>
        <div>{this.renderContent()}</div>
      </OasisWidgetFrame>
    );
  }
}

OasisMyOrders.displayName = 'OasisMyOrders';
OasisMyOrders.propTypes = propTypes;
OasisMyOrders.defaultProps = defaultProps;
export default OasisMyOrders;
