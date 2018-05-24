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
import { ETH_UNIT_ETHER } from "../constants";

const periodHeading = {
  [DAY]: "daily",
  [WEEK]: "weekly",
  [MONTH]: "monthly"
};

const tradingPairPriceTemplate = row =>
  row.tradingPairPrice ? (
    <OasisSignificantDigitsWrapper
      amount={row.tradingPairPrice}
      fullPrecisionAmount={row.tradingPairPriceFullPrecision}
    />
  ) : (
    "N/A"
  );
const volumeTemplate = row =>
  row.volume ? (
    <OasisSignificantDigitsWrapper
      fullPrecisionUnit={ETH_UNIT_ETHER}
      fullPrecisionAmount={row.volumeFullPrecision}
      amount={row.volume}
    />
  ) : (
    "N/A"
  );

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
  }

  transformRow(row) {
    const { marketData = List() } = this.props;
    const [baseToken, quoteToken] = [row.get("base"), row.get("quote")];

    const pair = (
      <span className={styles.pair}>
        <span>{baseToken}</span>/<span>{quoteToken}</span>
      </span>
    );
    if (marketData) {
      const tradingPairTrades = trades(marketData, baseToken, quoteToken);
      const tradingPairVolume = volume(
        tradingPairTrades,
        baseToken,
        quoteToken
      );
      const tradingPairPrice = tradingPairVolume.toNumber()
        ? price(tradingPairTrades.last(), baseToken, quoteToken)
        : null;
      return {
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
        rawTradingPair: { baseToken: baseToken, quoteToken: quoteToken }
      };
    } else {
      return {
        tradingPair: pair,
        volume: null,
        tradingPairPrice: null,
        rawTradingPair: { baseToken: baseToken, quoteToken: quoteToken }
      };
    }
  }

  onTableRowClick(rowData) {
    const { setActiveTradingPair, changeRoute } = this.props;
    const { baseToken, quoteToken } = rowData.rawTradingPair;
    setActiveTradingPair({ baseToken, quoteToken });
    changeRoute(`/trade/${baseToken}/${quoteToken}`);
  }

  render() {
    const { tradedTokens, defaultPeriod } = this.props;
    return (
      <OasisWidgetFrame heading="MARKETS">
        <OasisTable
          onRowClick={this.onTableRowClick}
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
  marketData: ImmutablePropTypes.list
};
export default CSSModules(OasisMarketWidget, styles, { allowMultiple: true });
