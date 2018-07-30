/* eslint-disable react/display-name */
import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { fromJS } from "immutable";
import ImmutablePropTypes from "react-immutable-proptypes";

import { DESCENDING, orderByTimestamp } from "../utils/sort";
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
import openEtherscanTransactionLink from "../utils/openEtherscanTransactionLink";
import { myOffersDisplayFormat } from "../utils/offers/myOffersDisplayFormat";
import { toHistoricalTrades } from "../utils/offers/toHistoricalTrades";

const myOpenOffersFilter = entry => {
  const myAccountAddress = web3.eth.defaultAccount;
  return (
    entry.owner.toString() === myAccountAddress.toString() &&
    entry.status !== OFFER_STATUS_INACTIVE
  );
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

const propTypes = {
  trades: ImmutablePropTypes.list,
  onFetchAndSubscribeUserTradesHistory: PropTypes.func.isRequired,
  activeNetworkName: PropTypes.string,
  removeOrderCancelledByTheOwner: PropTypes.func,
  initialMarketHistoryLoaded: PropTypes.bool,
  loadingUserMarketHistory: PropTypes.bool,
  activeTradingPairOffersInitiallyLoaded: PropTypes.bool,
  activeTradingPair: PropTypes.object,
  sellOffers: PropTypes.object,
  buyOffers: PropTypes.object,
  cancelOffer: PropTypes.func,
  defaultAccount: PropTypes.string
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
      const { trades, loadingUserMarketHistory } = this.props;
      console.log({trades, loadingUserMarketHistory });
      if (!trades && !loadingUserMarketHistory) {
          this.props.onFetchAndSubscribeUserTradesHistory()
      }
      this.setState({
        viewType: value
      });
    }
  }

  static onRowClick({ transactionHash }, { activeNetworkName }) {
    openEtherscanTransactionLink({ activeNetworkName, transactionHash });
  }

  renderOpenOffers() {
    const {
      activeTradingPair: { baseToken, quoteToken },
      sellOffers = [],
      buyOffers = [],
      cancelOffer,
      activeNetworkName,
      activeTradingPairOffersInitiallyLoaded
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
      .map(myOffersDisplayFormat);

    const emptyTableFallback = (
      <div className={styles.info}>
        {activeTradingPairOffersInitiallyLoaded ? 'You currently have no active offers': ''}
      </div>
    );
    return (
      <div>
        <OasisTable
          metadata={{ activeNetworkName }}
          rows={myOpenOffers.toArray()}
          col={this.openOrdersColsDefinition(
            baseToken,
            quoteToken,
            orderActions
          )}
          className={styles.openOffers}
          emptyFallback={emptyTableFallback}
        />
      </div>
    );
  }

  renderTradesHistory() {
    const {
      defaultAccount,
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
      tradeHistoryEntry => toHistoricalTrades(tradeHistoryEntry, defaultAccount, baseToken, quoteToken)
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
            <div className={styles.info}/>
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

  getLoadingText() {
    if (this.state.viewType=== VIEW_TYPE_MARKET_HISTORY) {
      return "Your trades history"
    } else if (this.state.viewType=== VIEW_TYPE_OPEN_OFFERS) {
      return "Your active orders";
    }
  }

  render() {
    const { offerToCancel } = this.state;
    const { loadingUserMarketHistory, activeTradingPairOffersInitiallyLoaded } = this.props;
    return (
      <OasisWidgetFrame
        isLoadingData={!activeTradingPairOffersInitiallyLoaded || loadingUserMarketHistory}
        loadingDataText={this.getLoadingText()}
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
