import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import tokens from './../store/selectors/tokens';

import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisSelect from "./OasisSelect";
import OasisChartPrice from './OasisChartPrice';
import OasisChartVolume from './OasisChartVolume';
import OasisChartDepth from './OasisChartDepth';

import styles from './OasisChart.scss';

const propTypes = PropTypes && {
  activeTradingPair: PropTypes.object.isRequired,
};
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
    const select = (
      <OasisSelect value={this.state.chart} onChange={this.chartChanged} className={styles.select}>
        { types.map(t => <option key={t}>{t}</option>) }
      </OasisSelect>
    );

    return (
        <OasisWidgetFrame heading="Charts" headingChildren={select} spaceForContent={true}>
            { this.state.chart == "PRICE" && <OasisChartPrice tradingPair={this.props.activeTradingPair}/> }
            { this.state.chart == "VOLUME" && <OasisChartVolume tradingPair={this.props.activeTradingPair}/> }
            { this.state.chart == "DEPTH" && <OasisChartDepth tradingPair={this.props.activeTradingPair}/> }
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

export const CHART_HEIGHT = "180px";

export function tooltipContainer(tooltip, canvas) {
  if (!canvas)
    return null;
  let tooltipEl = document.getElementById('chartjs-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'chartjs-tooltip';
    tooltipEl.className = styles.chartjsTooltip;
    document.body.appendChild(tooltipEl);
  }
  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return false;
  }
  // Set caret Position
  tooltipEl.classList.remove('above', 'below', 'no-transform');
  if (tooltip.yAlign) {
    tooltipEl.classList.add(tooltip.yAlign);
  } else {
    tooltipEl.classList.add('no-transform');
  }
  const position = canvas.getBoundingClientRect();
  tooltipEl.style.left = `${position.left + tooltip.caretX}px`;
  tooltipEl.style.top = `${position.top + window.pageYOffset + tooltip.caretY}px`;
  tooltipEl.style.padding = `${tooltip.yPadding}px${tooltip.xPadding}px`;
  return tooltipEl;
}
