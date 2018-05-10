import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import charts from './../store/selectors/charts';

import {Line} from 'react-chartjs-2';

const propTypes = PropTypes && {
  priceChartData: PropTypes.array.isRequired,
  priceChartLabels: PropTypes.array.isRequired,
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
        data={{
          labels: this.props.priceChartLabels,
          datasets: [{
            data: this.props.priceChartData,
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
          },
          legend: {
            display: false,
          },
          scales: {
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
    priceChartData: charts.priceChartData(state, props),
    priceChartLabels: charts.priceChartLabels(state, props),
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
