import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import web3 from '../../bootstrap/web3';
import {mapValues} from 'lodash';

const trades = state => state.get('trades').get('marketHistory');

const tokenTrades = createSelector(
  trades,
  reselect.getProps,
  (trades, props) => {
    const tokens = props ? [props.tradingPair.baseToken, props.tradingPair.quoteToken] : [];
    return (trades || []).filter(t =>
      t.buyWhichToken == tokens[0] && t.sellWhichToken == tokens[1] ||
      t.buyWhichToken == tokens[1] && t.sellWhichToken == tokens[0]
    )
  },
)


const priceChartTrades = createSelector(
  tokenTrades,
  (trades) => {
    const since = moment(Date.now()).startOf('day').subtract(6, 'days').unix()
    const res = (trades || []).filter(t =>
      t.timestamp >= since
    );
    return res.length == 0 ? [] : res.toJS();
  }
)

const priceChartLabels = createSelector(
  priceChartTrades,
  (priceChartTrades) => priceChartTrades.map((trade) => trade.timestamp)
)

const priceChartValues = createSelector(
  priceChartTrades,
  reselect.getProps,
  (priceChartTrades, props) => priceChartTrades.map((trade) => {
    let baseAmount;
    let quoteAmount;
    if (trade.buyWhichToken === props.tradingPair.quoteToken) {
      quoteAmount = new BigNumber(trade.buyHowMuch);
      baseAmount = new BigNumber(trade.sellHowMuch);
    } else {
      baseAmount = new BigNumber(trade.buyHowMuch);
      quoteAmount = new BigNumber(trade.sellHowMuch);
    }
    return quoteAmount.dividedBy(baseAmount).toFixed(4);
  })
)


const volumeChartTrades = createSelector(
  tokenTrades,
  (trades) => {
    const since = moment(Date.now()).startOf('day').subtract(6, 'days').unix()
    return (trades || []).filter(t =>
      t.timestamp >= since
    );
  }
)

const volumeChartPoints = createSelector(
  () => {
      return [6, 5, 4, 3, 2, 1, 0].map(i =>
        moment(Date.now()).startOf('day').subtract(i, 'days')
      )
  }
)

const volumeChartLabels = createSelector(
  volumeChartPoints,
  (volumeChartPoints) => volumeChartPoints.map(d => d.unix())
)

const volumeChartData = createSelector(
  volumeChartTrades,
  volumeChartPoints,
  reselect.getProps,
  (volumeChartTrades, volumeChartPoints, props) => {
      let volumes = {base: {}, quote: {}}
      volumeChartPoints.forEach(day => {
        volumes.base[day.unix()] = new BigNumber(0);
        volumes.quote[day.unix()] = new BigNumber(0);
      })
      volumeChartTrades.forEach(trade => {
        const day = moment.unix(trade.timestamp).startOf('day').unix();
        if (trade.buyWhichToken === props.tradingPair.quoteToken) {
          volumes.quote[day] = volumes.quote[day].add(new BigNumber(trade.buyHowMuch));
          volumes.base[day] = volumes.base[day].add(new BigNumber(trade.sellHowMuch));
        } else {
          volumes.quote[day] = volumes.quote[day].add(new BigNumber(trade.sellHowMuch));
          volumes.base[day] = volumes.base[day].add(new BigNumber(trade.buyHowMuch));
        }
      })
      return volumes;
  }
)

const volumeChartValues = createSelector(
  volumeChartData,
  (volumeChartData) => Object.keys(volumeChartData.quote).map((key) =>
    web3.fromWei(volumeChartData.quote[key]).toFixed(2)
  )
)

const volumeChartTooltips = createSelector(
  volumeChartData,
  (volumeChartData) => ({
    base: mapValues(volumeChartData.base, (v) => web3.fromWei(v).toFormat(2)),
    quote: mapValues(volumeChartData.quote, (v) => web3.fromWei(v).toFormat(2)),
  })
)

export default {
  priceChartLabels,
  priceChartValues,
  volumeChartLabels,
  volumeChartValues,
  volumeChartTooltips,
}
