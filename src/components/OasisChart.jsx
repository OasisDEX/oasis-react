import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import tokens from './../store/selectors/tokens';

import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisChartPrice from './OasisChartPrice';
import OasisChartVolume from './OasisChartVolume';
import OasisChartDepth from './OasisChartDepth';

// import styles from './OasisChart.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

export class OasisChart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {chart: 'PRICE'};
    this.chartChanged = this.chartChanged.bind(this);
  }

  chartChanged(e) {
    this.setState({chart: e.target.value});
  }

  render() {
    const types = ['PRICE', 'VOLUME', 'DEPTH'];
    return (
        <OasisWidgetFrame heading="Charts">
          <select value={this.state.chart} onChange={this.chartChanged}>
            { types.map(t => <option key={t}>{t}</option>) }
          </select>
          <div>
            { this.state.chart == "PRICE" && <OasisChartPrice tradingPair={this.props.activeTradingPair}/> }
            { this.state.chart == "VOLUME" && <OasisChartVolume tradingPair={this.props.activeTradingPair}/> }
            { this.state.chart == "DEPTH" && <OasisChartDepth tradingPair={this.props.activeTradingPair}/> }
          </div>
        </OasisWidgetFrame>
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeTradingPair: tokens.activeTradingPair(state),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisChart.displayName = 'OasisChart';
OasisChart.propTypes = propTypes;
OasisChart.defaultProps = defaultProps;
export default connect(mapStateToProps, mapDispatchToProps)(OasisChart);
