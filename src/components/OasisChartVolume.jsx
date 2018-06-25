import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import charts from './../store/selectors/charts';

import {Line} from 'react-chartjs-2';
import {tooltipContainer, CHART_HEIGHT} from './OasisChart';
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
        height={CHART_HEIGHT}
        data={{
          labels: this.props.volumeChartLabels,
          datasets: [{
            label: `SUM(${this.props.tradingPair.quoteToken})`,
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
            custom: this.showTooltip.bind(this),
          },
          legend: {
            display: false,
          },
          scales: {
            yAxes: [{
              scaleLabel: {
                display: false,
                labelString: 'VOLUME',
              },
              ticks: {
                beginAtZero: true,
              },
            }],
            xAxes: [{
              display: true,
              ticks: {
                callback: ts => moment.unix(ts).format('DD/MM'),
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
      const ts = this.props.volumeChartLabels[tooltip.dataPoints[0].index];
      const date = moment.unix(ts).format('ll');
      let quoteAmount = this.props.volumeChartTooltips.quote[tooltip.dataPoints[0].index];
      let baseAmount = this.props.volumeChartTooltips.base[tooltip.dataPoints[0].index];
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
