import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';
import moment from 'moment'
import BigNumber from 'bignumber.js'
import web3 from '../../bootstrap/web3';
import {formatNumber} from '../../utils/functions'

const trades = state => state.get('trades').get('marketHistory');

const tokenTrades = createSelector(
  trades,
  reselect.getProps,
  (trades, props) => {
    const tokens = props ? [props.tradingPair.baseToken, props.tradingPair.quoteToken] : [];
    return (trades || []).filter(t =>
      tokens.includes(t.buyWhichToken) || tokens.includes(t.sellWhichToken)
    );
  },
)


const priceChartTrades = createSelector(
  tokenTrades,
  (trades) => {
    const since = moment(Date.now()).startOf('day').subtract(6, 'days').unix()
    return (trades || []).filter(t =>
      t.timestamp >= since
    );
  }
)

const priceChartLabels = createSelector(
  priceChartTrades,
  (priceChartTrades) => priceChartTrades.map((trade) => trade.timestamp)
)

const priceChartData = createSelector(
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
    return formatNumber(quoteAmount.dividedBy(baseAmount), 5);
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

const volumeChartLabels = createSelector(
  () => {
      return [6, 5, 4, 3, 2, 1, 0].map(i =>
        moment(Date.now()).startOf('day').subtract(i, 'days')
      )
  }
)

const volumeChartData = createSelector(
  volumeChartTrades,
  volumeChartLabels,
  reselect.getProps,
  (volumeChartTrades, volumeChartLabels, props) => {
      let volumes = {base: {}, quote: {}}
      volumeChartLabels.forEach(day => {
        volumes.base[day.unix() * 1000] = new BigNumber(0);
        volumes.quote[day.unix() * 1000] = new BigNumber(0);
      })
      volumeChartTrades.forEach(trade => {
        const day = moment.unix(trade.timestamp).startOf('day').unix() * 1000;
        if (trade.buyWhichToken === props.tradingPair.quoteToken) {
          volumes.quote[day] = volumes.quote[day].add(new BigNumber(trade.buyHowMuch));
          volumes.base[day] = volumes.base[day].add(new BigNumber(trade.sellHowMuch));
        } else {
          volumes.quote[day] = volumes.quote[day].add(new BigNumber(trade.sellHowMuch));
          volumes.base[day] = volumes.base[day].add(new BigNumber(trade.buyHowMuch));
        }
      })
      return Object.keys(volumes.quote).map((key) =>
        formatNumber(web3.fromWei(volumes.quote[key]), 5).replace(/,/g, '')
      )
  }
)

export default {
  priceChartLabels,
  priceChartData,
  volumeChartLabels,
  volumeChartData,
}
