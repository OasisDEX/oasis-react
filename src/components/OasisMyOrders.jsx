/* eslint-disable react/display-name */
import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { fromJS } from "immutable";
import BigNumber from "bignumber.js";
import ImmutablePropTypes from "react-immutable-proptypes";
import moment from "moment";

import { DESCENDING, orderByTimestamp } from "../utils/sort";
import { formatAmount, formatPrice, price } from "../utils/tokens/pair";
import { OasisTable } from "./OasisTable";
import { OasisTradeType } from "./OasisTradeType";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import web3 from "../bootstrap/web3";
import { ASK, BID } from "../store/reducers/trades";
import { ETH_UNIT_ETHER } from "../constants";
import { isOfferOwner } from "../utils/orders";
import OasisSelect from "./OasisSelect";
import styles from "./OasisMyOrders.scss";
import OasisOfferCancelModalWrapper from "../containers/OasisOfferCancelModal";
import { OFFER_STATUS_INACTIVE, TYPE_BUY_OFFER, TYPE_SELL_OFFER } from '../store/reducers/offers';
import { OasisSignificantDigitsWrapper } from "../containers/OasisSignificantDigits";
import OasisButton from "./OasisButton";

const myOrdersDisplayFormat = offer => {
  let baseAmount = null,
    baseAmountFullPrecision = null,
    quoteAmount = null,
    quoteAmountFullPrecision = null;
  switch (offer.tradeType) {
    case BID:
      baseAmount = formatAmount(offer.buyHowMuch, true, ETH_UNIT_ETHER);
      baseAmountFullPrecision = offer.buyHowMuch;
      quoteAmount = formatAmount(offer.sellHowMuch, true, ETH_UNIT_ETHER);
      quoteAmountFullPrecision = offer.sellHowMuch;
      break;
    case ASK:
      baseAmount = formatAmount(offer.sellHowMuch, true, ETH_UNIT_ETHER);
      baseAmountFullPrecision = offer.sellHowMuch;
      quoteAmount = formatAmount(offer.buyHowMuch, true, ETH_UNIT_ETHER);
      quoteAmountFullPrecision = offer.buyHowMuch;
      break;
  }

  return {
    offerType: offer.offerType,
    tradeTypeEl: offer.tradeTypeEl,
    price: formatPrice(offer.price),
    priceFullPrecision: offer.price,
    baseAmount,
    baseAmountFullPrecision,
    quoteAmount,
    quoteAmountFullPrecision,
    owner: offer.owner,
    id: offer.id
  };
};

const myOpenOffersFilter = entry => {
  const myAccountAddress = web3.eth.defaultAccount;
  return entry.owner.toString() === myAccountAddress.toString() && entry.status !== OFFER_STATUS_INACTIVE;
};

const myOffersFilter = entry => {
  const myAccountAddress = web3.eth.defaultAccount;
  const isOfferMaker = entry.maker.toString() === myAccountAddress.toString();
  const isOfferTaker = entry.taker.toString() === myAccountAddress.toString();
  return isOfferMaker || isOfferTaker;
};

let actionsColumnTemplate = function(offer) {
  const { offerToCancel } = this.state;
  return isOfferOwner(offer) ? (
    <div>
      <OasisButton
        size="xs"
        disabled={offerToCancel}
        onClick={() => this.setState({ offerToCancel: offer })}
      >
        Cancel
      </OasisButton>
    </div>
  ) : null;
};

const tradesHistoryColsDefinition = (baseToken, quoteToken) => [
  { heading: "date", key: "date" },
  { heading: "action", key: "tradeType" },
  {
    heading: `price`,
    template: row => (
      <OasisSignificantDigitsWrapper
        fullPrecisionAmount={row.priceFullPrecision}
        amount={row.price}
      />
    )
  },
  {
    heading: `${quoteToken}`,
    template: row => (
      <OasisSignificantDigitsWrapper
        fullPrecisionUnit={ETH_UNIT_ETHER}
        fullPrecisionAmount={row.quoteAmountFullPrecision}
        amount={row.quoteAmount}
      />
    )
  },
  {
    heading: `${baseToken}`,
    template: row => (
      <OasisSignificantDigitsWrapper
        fullPrecisionUnit={ETH_UNIT_ETHER}
        fullPrecisionAmount={row.baseAmountFullPrecision}
        amount={row.baseAmount}
      />
    )
  }
];

const openOrdersColsDefinition = (baseToken, quoteToken, orderActions) => [
  { heading: "action", key: "tradeTypeEl" },
  {
    heading: `price`,
    template: row => (
      <OasisSignificantDigitsWrapper
        fullPrecisionAmount={row.priceFullPrecision}
        amount={row.price}
      />
    )
  },
  {
    heading: `${quoteToken}`,
    template: row => (
      <OasisSignificantDigitsWrapper
        fullPrecisionUnit={ETH_UNIT_ETHER}
        fullPrecisionAmount={row.quoteAmountFullPrecision}
        amount={row.quoteAmount}
      />
    )
  },
  {
    heading: `${baseToken}`,
    template: row => (
      <OasisSignificantDigitsWrapper
        fullPrecisionUnit={ETH_UNIT_ETHER}
        fullPrecisionAmount={row.baseAmountFullPrecision}
        amount={row.baseAmount}
      />
    )
  },
  { heading: ``, template: actionsColumnTemplate.bind(orderActions) }
];

const propTypes = PropTypes && {
  trades: ImmutablePropTypes.list
};
const defaultProps = {};

class OasisMyOrders extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.viewType = "Open";
    this.onViewTypeChange = this.onViewTypeChange.bind(this);
    actionsColumnTemplate = actionsColumnTemplate.bind(this);
  }

  onViewTypeChange(ev) {
    this.viewType = ev.target.value;
    this.forceUpdate();
  }

  renderOpenOffers() {
    const {
      activeTradingPair: { baseToken, quoteToken },
      sellOffers = [],
      buyOffers = [],
      cancelOffer
    } = this.props;
    const orderActions = { cancelOffer };
    const myOpenOffers = sellOffers
      .map(so => ({
        ...so,
        tradeType: ASK,
        offerType: TYPE_SELL_OFFER,
        tradeTypeEl: <OasisTradeType type={ASK} />,
        price: so.ask_price
      }))
      .concat(
        buyOffers.map(bo => ({
          ...bo,
          tradeType: BID,
          offerType: TYPE_BUY_OFFER,
          tradeTypeEl: <OasisTradeType type={BID} />,
          price: bo.bid_price
        }))
      )
      .filter(myOpenOffersFilter)
      .sort((p, c) => (p.bid_price_sort < c.bid_price_sort ? 1 : -1))
      .map(myOrdersDisplayFormat);

    if (myOpenOffers.count()) {
      return (
        <div>
          <OasisTable
            rows={myOpenOffers.toArray()}
            col={openOrdersColsDefinition(baseToken, quoteToken, orderActions)}
            className={styles.openOffers}
          />
        </div>
      );
    } else {
      return (
        <div className={styles.info}>You currently have no active offers</div>
      );
    }
  }

  renderTradesHistory() {
    const toHistoricalTrades = tradeHistoryEntry => {
      let baseAmount = null,
        quoteAmount = null;

      if (
        tradeHistoryEntry.buyWhichToken === quoteToken &&
        tradeHistoryEntry.sellWhichToken === baseToken
      ) {
        baseAmount = new BigNumber(tradeHistoryEntry.sellHowMuch);
        quoteAmount = new BigNumber(tradeHistoryEntry.buyHowMuch);
      } else if (
        tradeHistoryEntry.buyWhichToken === baseToken &&
        tradeHistoryEntry.sellWhichToken === quoteToken
      ) {
        baseAmount = new BigNumber(tradeHistoryEntry.buyHowMuch);
        quoteAmount = new BigNumber(tradeHistoryEntry.sellHowMuch);
      }

      return {
        date: moment.unix(tradeHistoryEntry.timestamp).format("DD-MM HH:mm"),
        tradeType: (
          <OasisTradeType order={tradeHistoryEntry} baseCurrency={baseToken} />
        ),
        baseAmount: formatAmount(baseAmount, true),
        baseAmountFullPrecision: baseAmount,
        quoteAmount: formatAmount(quoteAmount, true),
        quoteAmountFullPrecision: quoteAmount,
        price: formatPrice(price(tradeHistoryEntry, baseToken, quoteToken)),
        priceFullPrecision: price(tradeHistoryEntry, baseToken, quoteToken)
      };
    };
    const { trades, activeTradingPair: { baseToken, quoteToken } } = this.props;
    const myTrades = trades.filter(myOffersFilter);
    const marketHistory = orderByTimestamp(myTrades.toJSON(), DESCENDING).map(
      toHistoricalTrades
    );
    if (myTrades.count()) {
      return (
        <OasisTable
          rows={marketHistory}
          col={tradesHistoryColsDefinition(baseToken, quoteToken)}
          className={styles.tradesHistory}
        />
      );
    } else {
      return <div className={styles.info}>Your trades history is empty</div>;
    }
  }

  renderContent() {
    switch (this.viewType) {
      case "Open":
        return this.renderOpenOffers();
      case "Closed":
        return this.renderTradesHistory();
    }
  }

  renderSelect() {
    return (
      <OasisSelect
        onChange={this.onViewTypeChange}
        value={this.viewType}
        className={styles.select}
      >
        <option value={"Open"}>Open</option>
        <option value={"Closed"}>Closed</option>
      </OasisSelect>
    );
  }

  render() {
    const { offerToCancel } = this.state;
    return (
      <OasisWidgetFrame
        heading={"MY ORDERS"}
        headingChildren={this.renderSelect()}
      >
        {offerToCancel && (
          <OasisOfferCancelModalWrapper
            onModalClose={() => this.setState({ offerToCancel: undefined })}
            offer={fromJS(offerToCancel)}
          />
        )}
        <div>{this.renderContent()}</div>
      </OasisWidgetFrame>
    );
  }
}

OasisMyOrders.displayName = "OasisMyOrders";
OasisMyOrders.propTypes = propTypes;
OasisMyOrders.defaultProps = defaultProps;
export default OasisMyOrders;
