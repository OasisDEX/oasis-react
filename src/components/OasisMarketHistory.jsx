import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import moment from "moment";
import BigNumber from "bignumber.js";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import { OasisTable } from "./OasisTable";
import { OasisTradeType } from "./OasisTradeType";
import { price, formatPrice, formatAmount } from "../utils/tokens/pair";
import { orderByTimestamp, DESCENDING } from "../utils/sort";
import styles from "./OasisMarketHistory.scss";
import CSSModules from "react-css-modules";

import ImmutablePropTypes from "react-immutable-proptypes";
import createEtherscanTransactionLink from "../utils/createEtherscanTransactionLink";
import { OasisSignificantDigitsWrapper } from "../containers/OasisSignificantDigits";
import OasisLoadingIndicator from "./OasisLoadingIndicator";
import { ETH_UNIT_ETHER } from "../constants";

const propTypes = PropTypes && {
  activeTradingPair: PropTypes.object.isRequired,
  trades: ImmutablePropTypes.list.isRequired,
  activeNetworkName: PropTypes.string
};
const defaultProps = {};

const baseTokenTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionAmount={row.baseAmountFullPrecision}
    fullPrecisionUnit={ETH_UNIT_ETHER}
    amount={row.baseAmount}
  />
);
const quoteTokenTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionAmount={row.quoteAmountFullPrecision}
    fullPrecisionUnit={ETH_UNIT_ETHER}
    amount={row.quoteAmount}
  />
);
const priceTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionAmount={row.price}
    amount={row.price}
  />
);

const colsDefinition = (baseToken, quoteToken) => {
  return [
    { heading: "date", key: "date" },
    { heading: "action", key: "tradeType" },
    { heading: `price`, template: priceTemplate },
    { heading: `${quoteToken}`, template: quoteTokenTemplate },
    { heading: `${baseToken}`, template: baseTokenTemplate }
  ];
};

class OasisMarketHistory extends PureComponent {
  static onRowClick({ transactionHash }, { activeNetworkName }) {
    window.open(
      createEtherscanTransactionLink({ activeNetworkName, transactionHash }),
      "_blank"
    );
    window.focus();
  }

  render() {
    const {
      activeNetworkName,
      trades,
      activeTradingPair: { baseToken, quoteToken },
      loadingTradeHistory
    } = this.props;
    const sortedTrades = orderByTimestamp(trades.toJSON(), DESCENDING);

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
        date: moment.unix(tradeHistoryEntry.timestamp).format("DD-MM-HH:mm"),
        tradeType: (
          <OasisTradeType order={tradeHistoryEntry} baseCurrency={baseToken} />
        ),
        baseAmount: formatAmount(baseAmount, true),
        baseAmountFullPrecision: baseAmount,
        quoteAmount: formatAmount(quoteAmount, true),
        quoteAmountFullPrecision: quoteAmount,
        price: formatPrice(price(tradeHistoryEntry, baseToken, quoteToken)),
        priceAmountFullPrecision: price(tradeHistoryEntry, baseToken, quoteToken)
      };
    };

    const marketHistory = sortedTrades.map(toHistoricalTrades);

    return (
      <OasisWidgetFrame
        loadProgressSection={
          loadingTradeHistory ? <OasisLoadingIndicator /> : null
        }
        heading={`MARKET HISTORY (${sortedTrades.length})`}
      >
        <OasisTable
          onRowClick={OasisMarketHistory.onRowClick}
          className={styles.table}
          rows={marketHistory}
          col={colsDefinition(baseToken, quoteToken)}
          metadata={{ activeNetworkName }}
        />
      </OasisWidgetFrame>
    );
  }
}

OasisMarketHistory.displayName = "OasisMarketHistory";
OasisMarketHistory.propTypes = propTypes;
OasisMarketHistory.defaultProps = defaultProps;
export default CSSModules(OasisMarketHistory, styles, { allowMultiple: true });
