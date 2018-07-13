import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { List } from "immutable";
import ImmutablePropTypes from "react-immutable-proptypes";

import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import { OasisTable } from "./OasisTable";
import { DAY, MONTH, WEEK } from "../utils/period";
import {
  trades,
  volume,
  price,
  formatPrice,
  formatVolume
} from "../utils/tokens/pair";

import CSSModules from "react-css-modules";
import styles from "./OasisMarketWidget.scss";
import OasisSignificantDigitsWrapper from "../containers/OasisSignificantDigits";
import { ETH_UNIT_ETHER, TOKEN_DAI } from "../constants";
import moment from "moment-timezone";
import OasisLinkLikeButton from "./OasisLinkLikeButton";
import tokensReducer from "../store/reducers/tokens";
import OasisLoadingIndicator from "./OasisLoadingIndicator";

const periodHeading = {
  [DAY]: "daily",
  [WEEK]: "weekly",
  [MONTH]: "monthly"
};

const tradingPairPriceTemplate = row => {
  if (row && row.initialMarketHistoryLoaded) {
    return row.tradingPairPrice ? (
      <OasisSignificantDigitsWrapper
        fractionalZerosGrey={false}
        fullPrecisionAmount={row.tradingPairPriceFullPrecision}
        amount={row.tradingPairPrice}
      />
    ) : (
      "N/A"
    );
  } else {
    return (
      <span style={{ position: "relative", right: "10px" }}>
        <OasisLoadingIndicator size="sm" />
      </span>
    );
  }
};
const volumeTemplate = row => {
  if (row && row.initialMarketHistoryLoaded) {
    return row.volume ? (
      <OasisSignificantDigitsWrapper
        fullPrecisionUnit={ETH_UNIT_ETHER}
        fullPrecisionAmount={row.volumeFullPrecision}
        amount={row.volume}
        fractionalZerosGrey={false}
      />
    ) : (
      "N/A"
    );
  } else {
    return (
      <span style={{ position: "relative", right: "20px" }}>
        <OasisLoadingIndicator size="sm" />
      </span>
    );
  }
};

const colDefinition = period => {
  return [
    { heading: "pairs", key: "tradingPair" },
    { heading: "price", template: tradingPairPriceTemplate },
    { heading: `${periodHeading[period]} volume`, template: volumeTemplate }
  ];
};

const isCurrentRowActive = (activeTradingPair, baseToken, quoteToken) => {
  if (!activeTradingPair) {
    return false;
  } else {
    return (
      activeTradingPair.baseToken === baseToken &&
      activeTradingPair.quoteToken === quoteToken
    );
  }
};

class OasisMarketWidget extends PureComponent {
  constructor(props) {
    super(props);
    this.transformRow = this.transformRow.bind(this);
    this.onTableRowClick = this.onTableRowClick.bind(this);
    this.now = Date.now() / 1000;
    this.weekAgo = moment(Date.now())
      .startOf("day")
      .subtract(6, "days")
      .unix();
  }

  transformRow(row) {
    const { marketData = List(), initialMarketHistoryLoaded } = this.props;
    const [baseToken, quoteToken] = [row.get("base"), row.get("quote")];

    const pair = (
      <span className={styles.pair}>
        <span>{baseToken}</span>/<span>{quoteToken}</span>
      </span>
    );
    if (marketData) {
      const weeklyTradingPairTrades = trades(
        marketData,
        baseToken,
        quoteToken
      ).filter(marketHistoryEntry => {
        const { timestamp } = marketHistoryEntry;

        if (timestamp > this.weekAgo) {
          return marketHistoryEntry;
        }
      });

      const tradingPairVolume = volume(
        weeklyTradingPairTrades,
        baseToken,
        quoteToken
      );

      const tradingPairPrice = tradingPairVolume.toNumber()
        ? price(weeklyTradingPairTrades.last(), baseToken, quoteToken)
        : null;
      return {
        initialMarketHistoryLoaded,
        isActive: isCurrentRowActive(
          this.props.activeTradingPair,
          baseToken,
          quoteToken
        ),
        tradingPair: pair,
        volume: formatVolume(tradingPairVolume),
        volumeFullPrecision: tradingPairVolume,
        tradingPairPrice: formatPrice(tradingPairPrice),
        tradingPairPriceFullPrecision: tradingPairPrice,
        rawTradingPair: { baseToken, quoteToken }
      };
    } else {
      return {
        initialMarketHistoryLoaded,
        tradingPair: pair,
        volume: null,
        tradingPairPrice: null,
        rawTradingPair: { baseToken, quoteToken }
      };
    }
  }

  onTableRowClick(rowData) {
    const {
      setActiveTradingPair,
      changeRoute,
      updateTradingPairOfferCount
    } = this.props;
    const { baseToken, quoteToken } = rowData.rawTradingPair;
    setActiveTradingPair({ baseToken, quoteToken });
    changeRoute(`/trade/${baseToken}/${quoteToken}`);
    updateTradingPairOfferCount(baseToken, quoteToken);
    tokensReducer.actions.getActiveTradingPairAllowanceStatus();
  }

  render() {
    const {
      activeTradingPair,
      tradedTokens,
      defaultPeriod,
      isMarketInitialized
    } = this.props;
    const daiButton = (
      <OasisLinkLikeButton
        href="https://dai.makerdao.com/"
        caption="CREATE DAI"
        target="_blank"
        className={styles.createDaiBtn}
      />
    );

    const activeTradingPairIncludesDAI =
      activeTradingPair &&
      [activeTradingPair.baseToken, activeTradingPair.quoteToken].includes(
        TOKEN_DAI
      );
    return (
      <OasisWidgetFrame
        heading="MARKETS"
        headingChildren={activeTradingPairIncludesDAI ? daiButton : null}
      >
        <OasisTable
          isInitializing={!isMarketInitialized}
          isInitializingText={"Market contract is initializing..."}
          onRowClick={isMarketInitialized ? this.onTableRowClick: null}
          className={styles.marketTable}
          col={colDefinition(defaultPeriod)}
          rows={tradedTokens.map(
            this.transformRow,
            this.props.activeTradingPair
          )}
          collapseEnabled={true}
          collapseInitial={true}
        />
      </OasisWidgetFrame>
    );
  }
}

OasisMarketWidget.displayName = "OasisMarketWidget";
OasisMarketWidget.propTypes = PropTypes && {
  tradedTokens: PropTypes.object.isRequired,
  marketData: ImmutablePropTypes.list,
  loadingTradeHistory: PropTypes.bool,
  initialMarketHistoryLoaded: PropTypes.bool,
  updateTradingPairOfferCount: PropTypes.func,
  isMarketInitialized: PropTypes.bool
};
export default CSSModules(OasisMarketWidget, styles, { allowMultiple: true });
