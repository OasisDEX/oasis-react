import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { last } from 'lodash';
import { List } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';

import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import { OasisTable } from './OasisTable';
import { DAY, MONTH, WEEK } from '../utils/period';
import { format, trades, volume, price, formatPrice, formatVolume } from '../utils/tokens/pair';



const periodHeading = {
  [DAY]: 'daily',
  [WEEK]: 'weekly',
  [MONTH]: 'monthly',
};

const colDefinition = (period) => {
  return [
    { heading: 'pairs', key: 'tradingPair' },
    { heading: 'price', key: 'tradingPairPrice' },
    { heading: `${periodHeading[period]} volume`, key: 'volume' },
  ];
};


const isCurrentRowActive = (activeTradingPair, baseToken, quoteToken) => {
  if(!activeTradingPair) {return false; } else {
    return activeTradingPair.baseToken === baseToken && activeTradingPair.quoteToken === quoteToken;
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
    const [baseToken, quoteToken] = [row.get('base'), row.get('quote')];

    if (marketData) {
      const tradingPairTrades = trades(marketData, baseToken, quoteToken);
      const tradingPairVolume = volume(tradingPairTrades, baseToken, quoteToken);
      const tradingPairPrice = tradingPairVolume.toNumber() ?
        price(last(tradingPairTrades), baseToken, quoteToken) : null;

      return {
        isActive: isCurrentRowActive(this.props.activeTradingPair, baseToken, quoteToken),
        tradingPair: format(baseToken, quoteToken),
        volume: formatVolume(tradingPairVolume),
        tradingPairPrice: formatPrice(tradingPairPrice),
      };
    } else {
      return {
        tradingPair: format(baseToken, quoteToken), volume: null, tradingPairPrice: null,
      };
    }
  }

  onTableRowClick(ev) {
    const { setActiveTradingPair, changeRoute } = this.props;
    const [baseToken, quoteToken] = ev.target.parentElement.getAttribute('data-tradingpair').split('/');
    setActiveTradingPair({baseToken, quoteToken});
    changeRoute(`/trade/${baseToken}/${quoteToken}`);
  }

  render() {
    const { tradedTokens, defaultPeriod } = this.props;
    return (
      <OasisWidgetFrame heading="MARKETS">
        <OasisTable onRowClick={this.onTableRowClick}
          col={colDefinition(defaultPeriod)}
          rows={tradedTokens.map(this.transformRow, this.props.activeTradingPair)}
        />
      </OasisWidgetFrame>
    );
  }
}

OasisMarketWidget.displayName = 'OasisMarketWidget';
OasisMarketWidget.propTypes = PropTypes && {
  tradedTokens: PropTypes.object.isRequired,
  marketData: ImmutablePropTypes.list,
};
export default OasisMarketWidget;