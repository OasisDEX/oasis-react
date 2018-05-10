import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import charts from './../store/selectors/charts';

import {Line} from 'react-chartjs-2';

const propTypes = PropTypes && {
  volumeChartData: PropTypes.array.isRequired,
  volumeChartLabels: PropTypes.array.isRequired,
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
            data: this.props.volumeChartData,
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
    volumeChartData: charts.volumeChartData(state, props),
    volumeChartLabels: charts.volumeChartLabels(state, props),
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
