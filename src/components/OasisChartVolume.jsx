import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import charts from './../store/selectors/charts';

import {Line} from 'react-chartjs-2';
import {tooltipContainer} from './OasisChart';
import moment from 'moment';

const propTypes = PropTypes && {
  volumeChartLabels: PropTypes.array.isRequired,
  volumeChartValues: PropTypes.array.isRequired,
  volumeChartTooltips: PropTypes.shape({
    base: PropTypes.array.isRequired,
    quote: PropTypes.array.isRequired,
  }).isRequired,
  tradingPair: PropTypes.shape({
    baseToken: PropTypes.string.isRequired,
    quoteToken: PropTypes.string.isRequired,
  }).isRequired,
};
const defaultProps = {};

export class OasisChartVolume extends PureComponent {
  render() {
    return (
      <Line
        data={{
          labels: this.props.volumeChartLabels,
          datasets: [{
            label: 'Volume',
            data: this.props.volumeChartValues,
            backgroundColor: 'rgba(140, 133, 200, 0.1)',
            borderColor: '#8D86C9',
            borderWidth: 3,
            // fill: false,
            pointBackgroundColor: '#8D86C9',
            pointRadius: 3,
          }],
        }}
        options={{
          layout: {
            padding: 5,
          },
          tooltips: {
            enabled: false,
            mode: 'index',
            position: 'nearest',
            custom: (tooltip) => {
              const tooltipEl = tooltipContainer(tooltip, document.getElementsByClassName("chartjs-render-monitor")[0]);
              if (tooltipEl && tooltip.body) {
                const ts = tooltip.dataPoints[0].xLabel;
                const date = moment.unix(ts).format('ll');
                let quoteAmount = this.props.volumeChartTooltips.quote[ts];
                let baseAmount = this.props.volumeChartTooltips.base[ts];
                tooltipEl.innerHTML =
                  `<div class="row-custom-tooltip">
                    <span class="left">Date</span>
                    <span class="right">${date}</span>
                  </div>
                  <div class="row-custom-tooltip middle">
                    <span class="left">SUM(${this.props.tradingPair.quoteToken})</span>
                    <span class="right">${quoteAmount}</span>
                  </div>
                  <div class="row-custom-tooltip">
                    <span class="left">SUM(${this.props.tradingPair.baseToken})</span>
                    <span class="right">${baseAmount}</span>
                  </div>`;
                tooltipEl.style.opacity = 1;
              }
            },
          },
          legend: {
            display: false,
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
            }],
            xAxes: [{
              display: false,
            }],
          },
        }}
      />
    );
  }
}

export function mapStateToProps(state, props) {
  return {
    volumeChartLabels: charts.volumeChartLabels(state, props),
    volumeChartValues: charts.volumeChartValues(state, props),
    volumeChartTooltips: charts.volumeChartTooltips(state, props),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisChartVolume.displayName = 'OasisChartVolume';
OasisChartVolume.propTypes = propTypes;
OasisChartVolume.defaultProps = defaultProps;
export default connect(mapStateToProps)(OasisChartVolume);
