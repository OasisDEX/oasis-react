import { createSelector } from 'reselect';
import reselect from '../../utils/reselect';
import moment from 'moment-timezone';
import BigNumber from 'bignumber.js';
import web3 from '../../bootstrap/web3';
import _ from 'lodash';
import {Map, List} from 'immutable';
import {removeOutliersFromArray} from '../../utils/functions'

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
    base: _.mapValues(volumeChartData.base, (v) => web3.fromWei(v).toFormat(2)),
    quote: _.mapValues(volumeChartData.quote, (v) => web3.fromWei(v).toFormat(2)),
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

const depthChartData = createSelector(
  offersBids,
  offersAsks,
  (bids, asks) => {
    let askPrices = [];
    let bidPrices = [];
    let askAmounts = { base: [], quote: [] };
    let bidAmounts = { base: [], quote: [] };

    asks.forEach(ask => {
      const index = askPrices.indexOf(ask.ask_price_sort);
      if (index === -1) {
        // If it is the first order for this price

        // Keep track of new price index
        askPrices.push(ask.ask_price_sort);

        if (askAmounts.quote.length > 0) {
          // If there is a lower price we need to sum the amount of the previous price (to make a cumulative graph)
          askAmounts.quote.push(askAmounts.quote[askAmounts.quote.length - 1].add(new BigNumber(ask.buyHowMuch.toString())));
          askAmounts.base.push(askAmounts.base[askAmounts.base.length - 1].add(new BigNumber(ask.sellHowMuch.toString())));
        } else {
          askAmounts.quote.push(new BigNumber(ask.buyHowMuch.toString()));
          askAmounts.base.push(new BigNumber(ask.sellHowMuch.toString()));
        }
      } else {
        // If there was already another offer for the same price we add the new amount
        askAmounts.quote[index] = askAmounts.quote[index].add(new BigNumber(ask.buyHowMuch.toString()));
        askAmounts.base[index] = askAmounts.base[index].add(new BigNumber(ask.sellHowMuch.toString()));
      }
    });

    bids.forEach(bid => {
      const index = bidPrices.indexOf(bid.bid_price_sort);
      if (index === -1) {
        // If it is the first order for this price

        // Keep track of new price index and value
        bidPrices.push(bid.bid_price_sort);
        bidAmounts.quote.push(new BigNumber(bid.sellHowMuch.toString()));
        bidAmounts.base.push(new BigNumber(bid.buyHowMuch.toString()));
      } else {
        bidAmounts.quote[index] = bidAmounts.quote[index].add(new BigNumber(bid.sellHowMuch.toString()));
        bidAmounts.base[index] = bidAmounts.base[index].add(new BigNumber(bid.buyHowMuch.toString()));
      }

      // It is necessary to update all the previous prices adding the actual amount (to make a cumulative graph)
      bidAmounts.quote = bidAmounts.quote.map((b, i) =>
        ((i < bidAmounts.quote.length - 1) ? b.add(bid.sellHowMuch) : b));
      bidAmounts.base = bidAmounts.base.map((b, i) =>
        ((i < bidAmounts.base.length - 1) ? b.add(bid.buyHowMuch) : b));
    });

    // All price values (bids & asks)
    const vals = _.uniq(bidPrices.concat(askPrices).sort((a, b) => {
      const val1 = new BigNumber(a.toString(10));
      const val2 = new BigNumber(b.toString(10));
      if (val1.lt(val2)) {
        return -1;
      }
      return 1;
    }));

    // Preparing arrays for graph
    const askAmountsGraph = [];
    const bidAmountsGraph = [];
    const askAmountsTooltip = {};
    const bidAmountsTooltip = {};

    let index = null;
    let amount = null;
    let amountTool = { quote: null, base: null };

    for (let i = 0; i < vals.length; i++) {
      index = askPrices.indexOf(vals[i]);
      if (index !== -1) {
        // If there is a specific value for the price in asks, we add it
        amount = web3.fromWei(askAmounts.quote[index]).toFixed(3);
        amountTool.quote = askAmounts.quote[index];
        amountTool.base = askAmounts.base[index];
      } else if (askPrices.length === 0 ||
        (new BigNumber(vals[i].toString(10))).lt((new BigNumber(askPrices[0].toString(10)))) ||
        (new BigNumber(vals[i].toString(10))).gt((new BigNumber(askPrices[askPrices.length - 1].toString(10))))) {
        // If the price is lower or higher than the asks range there is not value to print in the graph
        amount = null;
        amountTool.quote = amountTool.base = null;
      } else {
        // If there is not an ask amount for this price, we need to add the previous amount
        amount = askAmountsGraph[askAmountsGraph.length - 1];
        amountTool = { ...askAmountsTooltip[vals[i - 1]] };
      }
      askAmountsGraph.push({ x: vals[i], y: amount });
      askAmountsTooltip[vals[i]] = { ...amountTool };

      index = bidPrices.indexOf(vals[i]);
      if (index !== -1) {
        // If there is a specific value for the price in bids, we add it
        amount = web3.fromWei(bidAmounts.quote[index]).toFixed(3);
        amountTool.quote = bidAmounts.quote[index];
        amountTool.base = bidAmounts.base[index];
      } else if (bidPrices.length === 0 ||
        (new BigNumber(vals[i].toString(10))).lt((new BigNumber(bidPrices[0].toString(10)))) ||
        (new BigNumber(vals[i].toString(10))).gt((new BigNumber(bidPrices[bidPrices.length - 1].toString(10))))) {
        // If the price is lower or higher than the bids range there is not value to print in the graph
        amount = null;
        amountTool.quote = amountTool.base = null;
      } else {
        // If there is not a bid amount for this price, we need to add the next available amount
        for (let j = 0; j < bidPrices.length; j++) {
          if (bidPrices[j] >= vals[i]) {
            amount = web3.fromWei(bidAmounts.quote[j]).toFixed(3);
            amountTool.quote = bidAmounts.quote[j];
            amountTool.base = bidAmounts.base[j];
            break;
          }
        }
      }
      bidAmountsGraph.push({ x: vals[i], y: amount });
      bidAmountsTooltip[vals[i]] = { ...amountTool };
    }

    // console.log('askAmountsGraph', askAmountsGraph)
    // console.log('askAmountsTooltip', askAmountsTooltip)
    // console.log('bidAmountsGraph', bidAmountsGraph)
    // console.log('bidAmountsTooltip', bidAmountsTooltip)

    return {vals, bidAmountsGraph, askAmountsGraph, bidAmountsTooltip, askAmountsTooltip}
  }
)

const depthChartLabels = createSelector(
  depthChartData,
  (depthChartData) => depthChartData.vals
)

const depthChartValues = createSelector(
  depthChartData,
  (depthChartData) => ({
    buy: depthChartData.bidAmountsGraph,
    sell: depthChartData.askAmountsGraph,
  })
)

const depthChartTooltips = createSelector(
  depthChartData,
  (depthChartData) => ({
    buy: _.mapValues(depthChartData.bidAmountsTooltip, v => ({
      base: new BigNumber(web3.fromWei(v.base)).toFormat(2),
      quote: new BigNumber(web3.fromWei(v.quote)).toFormat(2),
    })),
    sell: _.mapValues(depthChartData.askAmountsTooltip, v => ({
      base: new BigNumber(web3.fromWei(v.base)).toFormat(2),
      quote: new BigNumber(web3.fromWei(v.quote)).toFormat(2),
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
