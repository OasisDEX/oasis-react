import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import charts from './../store/selectors/charts';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisChartPrice extends PureComponent {
  render() {
    return (
      <table>
        <tbody>
          <tr>
            <th>{this.props.tradingPair.baseToken} &rarr; {this.props.tradingPair.quoteToken}</th>
          </tr>
          <tr>
            <td>{this.props.priceChartLabels.size} &rarr; {this.props.priceChartData.size}</td>
          </tr>
        </tbody>
      </table>
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
