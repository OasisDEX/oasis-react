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
import {
  OFFER_STATUS_INACTIVE,
  TYPE_BUY_OFFER,
  TYPE_SELL_OFFER
} from "../store/reducers/offers";
import OasisSignificantDigitsWrapper from "../containers/OasisSignificantDigits";
import OasisButton from "./OasisButton";
import createEtherscanTransactionLink from "../utils/createEtherscanTransactionLink";
import OasisIcon from "./OasisIcon";

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
  return (
    entry.owner.toString() === myAccountAddress.toString() &&
    entry.status !== OFFER_STATUS_INACTIVE
  );
};

// const myOffersFilter = entry => {
//   const myAccountAddress = web3.eth.defaultAccount;
//   const isOfferMaker = entry.maker.toString() === myAccountAddress.toString();
//   const isOfferTaker = entry.taker.toString() === myAccountAddress.toString();
//   return isOfferMaker || isOfferTaker;
// };

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

const propTypes = PropTypes && {
  trades: ImmutablePropTypes.list,
  fetchAndSubscribeUserTradesHistory: PropTypes.func.isRequired,
  activeNetworkName: PropTypes.string,
  removeOrderCancelledByTheOwner: PropTypes.func,
  initialMarketHistoryLoaded: PropTypes.bool,
  loadingUserMarketHistory: PropTypes.bool
};
const defaultProps = {};

const VIEW_TYPE_OPEN_OFFERS = "Open";
const VIEW_TYPE_MARKET_HISTORY = "Closed";

class OasisMyOrders extends PureComponent {


  openOrdersColsDefinition(baseToken, quoteToken, orderActions) {
    return [
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
      { heading: ``, template: this.actionsColumnTemplate.bind(orderActions) }
    ];
  }

  actionsColumnTemplate(offer) {
    const { offerToCancel, lastCancelledOfferId } = this.state;
    const { activeTradingPair } = this.props;
    if (
      offer.id.toString() === lastCancelledOfferId &&
      String(lastCancelledOfferId)
    ) {
      this.props.removeOrderCancelledByTheOwner({
        offerType: offer.offerType,
        offerId: offer.id,
        tradingPair: activeTradingPair
      });
    }
    return isOfferOwner(offer) ? (
      <div>
        <OasisButton
          size="xs"
          disabled={
            offerToCancel ||
            (offer.id.toString() === lastCancelledOfferId &&
              String(lastCancelledOfferId))
          }
          onClick={() => {
            this.setState({ offerToCancel: offer });
          }}
        >
          Cancel
        </OasisButton>
      </div>
    ) : null;
  }

  constructor(props) {
    super(props);
    this.componentIsUnmounted = false;
    this.state = { viewType: VIEW_TYPE_OPEN_OFFERS };
    this.onViewTypeChange = this.onViewTypeChange.bind(this);
    this.actionsColumnTemplate = this.actionsColumnTemplate.bind(this);
  }

  onViewTypeChange({ target: { value } }) {
    if (this.componentIsUnmounted === false) {
      this.setState({
        viewType: value
      });
    }
  }

  static onRowClick({ transactionHash }, { activeNetworkName }) {
    window.open(
      createEtherscanTransactionLink({ activeNetworkName, transactionHash }),
      "_blank",
      "noopener"
    );
    window.focus();
  }

  renderOpenOffers() {
    const {
      activeTradingPair: { baseToken, quoteToken },
      sellOffers = [],
      buyOffers = [],
      cancelOffer,
      activeNetworkName
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

    const emptyTableFallback = (
      <div className={styles.info}>You currently have no active offers</div>
    );
    return (
      <div>
        <OasisTable
          metadata={{ activeNetworkName }}
          rows={myOpenOffers.toArray()}
          col={this.openOrdersColsDefinition(baseToken, quoteToken, orderActions)}
          className={styles.openOffers}
          emptyFallback={emptyTableFallback}
        />
      </div>
    );
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
        transactionHash: tradeHistoryEntry.transactionHash,
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
    const {
      trades = fromJS([]),
      activeNetworkName,
      activeTradingPair: { baseToken, quoteToken }
    } = this.props;
    const myTrades = trades.filter(tradeEntry => {
      if (
        (baseToken === tradeEntry.buyWhichToken &&
          tradeEntry.sellWhichToken === quoteToken) ||
        (quoteToken === tradeEntry.buyWhichToken &&
          tradeEntry.sellWhichToken === baseToken)
      ) {
        return tradeEntry;
      }
    });
    const marketHistory = orderByTimestamp(myTrades.toJSON(), DESCENDING).map(
      toHistoricalTrades
    );
    return (
      <OasisTable
        metadata={{ activeNetworkName }}
        onRowClick={OasisMyOrders.onRowClick}
        rows={marketHistory}
        col={tradesHistoryColsDefinition(baseToken, quoteToken)}
        className={styles.tradesHistory}
        emptyFallback={
          [true, null].includes(this.props.loadingUserMarketHistory) ? (
            <div className={styles.info}>
              {" "}
              <OasisIcon icon="loading" /> Your trades history is loading
            </div>
          ) : (
            <div className={styles.info}>Your trades history is empty</div>
          )
        }
      />
    );
  }

  renderContent() {
    switch (this.state.viewType) {
      case VIEW_TYPE_OPEN_OFFERS:
        return this.renderOpenOffers();
      case VIEW_TYPE_MARKET_HISTORY:
        return this.renderTradesHistory();
    }
  }

  renderSelect() {
    return (
      <OasisSelect
        onChange={this.onViewTypeChange}
        value={this.state.viewType}
        className={styles.select}
      >
        <option value={VIEW_TYPE_OPEN_OFFERS}>Open</option>
        <option value={VIEW_TYPE_MARKET_HISTORY}>Closed</option>
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
            onCancelledSuccesfully={lastCancelledOfferId => {
              this.setState({ lastCancelledOfferId });
            }}
            onModalClose={() => {
              if (this.componentIsUnmounted === false) {
                this.setState({ offerToCancel: undefined });
              }
            }}
            offer={fromJS(offerToCancel)}
          />
        )}
        <div>{this.renderContent()}</div>
      </OasisWidgetFrame>
    );
  }

  componentWillUnmount() {
    this.componentIsUnmounted = true;
  }

  // componentDidUpdate(prevProps, { viewType }) {
  //   const { fetchAndSubscribeUserTradesHistory } = this.props;
  //   const { viewType: currentViewType } = this.state;
  //   if (
  //     viewType !== currentViewType &&
  //     currentViewType === VIEW_TYPE_MARKET_HISTORY
  //   ) {
  //     fetchAndSubscribeUserTradesHistory(true);
  //   }
  // }
}

OasisMyOrders.displayName = "OasisMyOrders";
OasisMyOrders.propTypes = propTypes;
OasisMyOrders.defaultProps = defaultProps;
export default OasisMyOrders;
