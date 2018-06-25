import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';
import moment from 'moment-timezone';
import BigNumber from 'bignumber.js';
import web3 from '../../bootstrap/web3';
import _ from 'lodash';
import {Map, List} from 'immutable';
import {removeOutliersFromArray} from '../../utils/functions';

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
  () => (
    [6, 5, 4, 3, 2, 1, 0].map(i =>
      moment(Date.now()).startOf('day').subtract(i, 'days')
    )
  )
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
    base: Object.values(volumeChartData.base).map(v => web3.fromWei(v).toFormat(2)),
    quote: Object.values(volumeChartData.quote).map(v => web3.fromWei(v).toFormat(2)),
  })
)


const offers = state => state.get('offers').get('offers');

const offersBids = createSelector(
  offers,
  reselect.getProps,
  (offers, props) => (
    !props ? [] : removeOutliersFromArray(
      ((offers.get(Map({baseToken: props.tradingPair.baseToken, quoteToken: props.tradingPair.quoteToken})) || Map()).get('buyOffers') || List()).sortBy(b => b.bid_price_sort).toJS()
    , 'bid_price_sort', 3)
  ),
)

const offersAsks = createSelector(
  offers,
  reselect.getProps,
  (offers, props) => (
    !props ? [] : removeOutliersFromArray(
      ((offers.get(Map({baseToken: props.tradingPair.baseToken, quoteToken: props.tradingPair.quoteToken})) || Map()).get('sellOffers') || List()).sortBy(a => a.ask_price_sort).toJS()
    , 'ask_price_sort', 3)
  ),
)

function upSum(array) {
  return array.reduce(({sum, result}, bn) => (
    {sum: sum.add(bn), result: result.concat(bn.add(sum))}
  ), {sum: new BigNumber(0), result: []}).result;
}

function downSum(array) {
  return array.reduceRight(({sum, result}, bn) => (
    {sum: sum.add(bn), result: [bn.add(sum)].concat(result)}
  ), {sum: new BigNumber(0), result: []}).result;
}

function bigSum(array) {
  return array.reduce((sum, bn) =>
    sum ? sum.add(new BigNumber(bn)) : new BigNumber(bn)
  , null);
}

function groupBy(array, by = _.identity) {
  let result = [];
  array.forEach(e => {
    if ((result[result.length-1] || [])[0] && by((result[result.length-1] || [])[0]) == by(e))
      result[result.length-1].push(e);
    else
      result.push([e]);
  });
  return result;
}

function mapWithPreviousResult(array, mapper = _.identity) {
  return array.reduce(({prevRes, result}, e) => {
    const res = mapper(e, prevRes);
    return {prevRes: res, result: result.concat([res])};
  }, {prevRes: null, result: []}).result;
}

const depthChartData = createSelector(
  offersBids,
  offersAsks,
  (bids, asks) => {
    const askPrices = _.sortedUniq(asks.map(ask => ask.ask_price_sort));
    const askGroups = groupBy(asks, ask => ask.ask_price_sort);
    const askAmounts = {
      quote: upSum(askGroups.map(group => bigSum(group.map(ask => ask.buyHowMuch.toString())))),
      base: upSum(askGroups.map(group => bigSum(group.map(ask => ask.sellHowMuch.toString())))),
    };

    const bidPrices = _.sortedUniq(bids.map(bid => bid.bid_price_sort));
    const bidGroups = groupBy(bids, bid => bid.bid_price_sort);
    const bidAmounts = {
      quote: downSum(bidGroups.map(group => bigSum(group.map(bid => bid.sellHowMuch.toString())))),
      base: downSum(bidGroups.map(group => bigSum(group.map(bid => bid.buyHowMuch.toString())))),
    };

    const vals = _.uniq(bidPrices.concat(askPrices).sort((a, b) => new BigNumber(a.toString()).lt(new BigNumber(b.toString())) ? -1 : 1));

    const askAmountsData = mapWithPreviousResult(vals, (val, prevResult) => {
      const index = askPrices.indexOf(val);
      if (index !== -1) {
        // If there is a specific value for the price in asks, we add it
        return {
          graph: {x: val, y: web3.fromWei(askAmounts.quote[index]).toFixed(3)},
          tooltip: {quote: askAmounts.quote[index], base: askAmounts.base[index]},
        };
      } else if (askPrices.length === 0 ||
        (new BigNumber(val.toString())).lt((new BigNumber(askPrices[0].toString()))) ||
        (new BigNumber(val.toString())).gt((new BigNumber(askPrices[askPrices.length - 1].toString())))) {
        // If the price is lower or higher than the asks range there is not value to print in the graph
        return {
          graph: {x: val, y: null},
          tooltip: {quote: null, base: null},
        };
      } else {
        // If there is not an ask amount for this price, we need to add the previous amount
        return {
          graph: {x: val, y: prevResult.graph.y},
          tooltip: prevResult.tooltip,
        };
      }
    });

    const bidAmountsData = mapWithPreviousResult(vals.slice().reverse(), (val, prevResult) => {
      const index = bidPrices.indexOf(val);
      if (index !== -1) {
        // If there is a specific value for the price in bids, we add it
        return {
          graph: {x: val, y: web3.fromWei(bidAmounts.quote[index]).toFixed(3)},
          tooltip: {quote: bidAmounts.quote[index], base: bidAmounts.base[index]},
        };
      } else if (bidPrices.length === 0 ||
        (new BigNumber(val.toString())).lt((new BigNumber(bidPrices[0].toString()))) ||
        (new BigNumber(val.toString())).gt((new BigNumber(bidPrices[bidPrices.length - 1].toString())))) {
        // If the price is lower or higher than the bids range there is not value to print in the graph
        return {
          graph: {x: val, y: null},
          tooltip: {quote: null, base: null},
        };
      } else {
        // If there is not a bid amount for this price, we need to add the next available amount
        return {
          graph: {x: val, y: prevResult.graph.y},
          tooltip: prevResult.tooltip,
        };
      }
    });

    return {vals, askAmountsData, bidAmountsData: bidAmountsData.reverse()}
  }
)

const depthChartLabels = createSelector(
  depthChartData,
  (depthChartData) => depthChartData.vals
)

const depthChartValues = createSelector(
  depthChartData,
  (depthChartData) => ({
    buy: depthChartData.bidAmountsData.map(d => d.graph),
    sell: depthChartData.askAmountsData.map(d => d.graph),
  })
)

const depthChartTooltips = createSelector(
  depthChartData,
  (depthChartData) => ({
    buy: depthChartData.bidAmountsData.map(v => ({
      base: new BigNumber(web3.fromWei(v.tooltip.base)).toFormat(2),
      quote: new BigNumber(web3.fromWei(v.tooltip.quote)).toFormat(2),
    })),
    sell: depthChartData.askAmountsData.map(v => ({
      base: new BigNumber(web3.fromWei(v.tooltip.base)).toFormat(2),
      quote: new BigNumber(web3.fromWei(v.tooltip.quote)).toFormat(2),
    })),
  })
)


export default {
  priceChartLabels,
  priceChartValues,
  volumeChartLabels,
  volumeChartValues,
  volumeChartTooltips,
  depthChartLabels,
  depthChartValues,
  depthChartTooltips,
}
