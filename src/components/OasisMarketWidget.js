import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { List } from "immutable";
import moment from "moment-timezone";
import ImmutablePropTypes from "react-immutable-proptypes";
import CSSModules from "react-css-modules";

import { TOKEN_DAI } from "../constants";
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

import OasisLinkLikeButton from "./OasisLinkLikeButton";
import tokensReducer from "../store/reducers/tokens";
import { OasisMarketWidgetVolumeTemplate } from "./OasisMarketWidgetVolumeTemplate";
import { OasisMarketWidgetTradingPairPriceTemplate } from "./OasisMarketWidgetTradingPairPriceTemplate";
import styles from "./OasisMarketWidget.scss";

const periodHeading = {
  [DAY]: "daily",
  [WEEK]: "weekly",
  [MONTH]: "monthly"
};

const colDefinition = period => {
  return [
    { heading: "pairs", key: "tradingPair" },
    { heading: "price", template: OasisMarketWidgetTradingPairPriceTemplate },
    {
      heading: `${periodHeading[period]} volume`,
      template: OasisMarketWidgetVolumeTemplate
    }
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

const daiButton = (
  <OasisLinkLikeButton
    href="https://dai.makerdao.com/"
    caption="CREATE DAI"
    target="_blank"
    className={styles.createDaiBtn}
  />
);

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
          onRowClick={isMarketInitialized ? this.onTableRowClick : null}
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
