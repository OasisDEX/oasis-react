import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import charts from './../store/selectors/charts';

import {Line} from 'react-chartjs-2';
import {tooltipContainer, CHART_HEIGHT} from './OasisChart';
import moment from 'moment';

const propTypes = PropTypes && {
  priceChartLabels: PropTypes.array.isRequired,
  priceChartValues: PropTypes.array.isRequired,
  tradingPair: PropTypes.shape({
    baseToken: PropTypes.string.isRequired,
    quoteToken: PropTypes.string.isRequired,
  }).isRequired,
};
const defaultProps = {};

export class OasisChartPrice extends PureComponent {
  render() {
    return (
      <Line
        height={CHART_HEIGHT}
        data={{
          labels: this.props.priceChartLabels,
          datasets: [{
            label: `${this.props.tradingPair.quoteToken} / ${this.props.tradingPair.baseToken}`,
            data: this.props.priceChartValues,
            borderColor: '#03A9F4',
            borderWidth: 3,
            pointBackgroundColor: '#03A9F4',
            pointRadius: 1,
            pointHitRadius: 5,
            pointHoverRadius: 4,
            backgroundColor: '#E2F3F9',
          }],
        }}
        options={{
          maintainAspectRatio: true,
          layout: {
            padding: 5,
          },
          tooltips: {
            enabled: false,
            mode: 'index',
            position: 'nearest',
            custom: this.showTooltip.bind(this),
          },
          legend: {
            display: false,
          },
          scales: {
            yAxes: [{
              scaleLabel: {
                display: false,
                labelString: 'PRICE',
              },
            }],
            xAxes: [{
              display: true,
              afterBuildTicks: this.removeRedundantTicks.bind(this),
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                callback: ts => ts && moment.unix(ts).format('DD/MM'),
              },
            }],
          },
        }}
      />
    );
  }

  showTooltip(tooltip) {
    const tooltipEl = tooltipContainer(tooltip, document.getElementsByClassName("chartjs-render-monitor")[0]);
    if (tooltipEl && tooltip.body) {
      const ts = this.props.priceChartLabels[tooltip.dataPoints[0].index];
      const date = moment.unix(ts).format('ll');
      const time = moment.unix(ts).format('LT');
      tooltipEl.innerHTML =
        `<div class="row-custom-tooltip">
          <span class="left">Date</span>
          <span class="right">${date}</span>
        </div>
        <div class="row-custom-tooltip middle">
          <span class="left">Time</span>
          <span class="right">${time}</span>
        </div>
        <div class="row-custom-tooltip middle">
          <span class="left">Price</span>
          <span class="right">${tooltip.dataPoints[0].yLabel}</span>
        </div>`;
      tooltipEl.style.opacity = 1;
    }
  }

  removeRedundantTicks(axis) {
    const REL_PADDING = 10;
    axis.ticks = axis.ticks.reduce(({lastDay, lastDayIndex, result}, tick, i) => {
      const day = moment.unix(tick).startOf('day').unix();
      return day == lastDay || (lastDayIndex !== null && i-lastDayIndex < axis.ticks.length/REL_PADDING) ?
        {lastDay, lastDayIndex, result: result.concat(null)} :
        {lastDay: day, lastDayIndex: i, result: result.concat(tick)};
    }, {lastDay: null, lastDayIndex: null, result: []}).result;
  }
}

export function mapStateToProps(state, props) {
  return {
    priceChartLabels: charts.priceChartLabels(state, props),
    priceChartValues: charts.priceChartValues(state, props),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisChartPrice.displayName = 'OasisChartPrice';
OasisChartPrice.propTypes = propTypes;
OasisChartPrice.defaultProps = defaultProps;
export default connect(mapStateToProps)(OasisChartPrice);
