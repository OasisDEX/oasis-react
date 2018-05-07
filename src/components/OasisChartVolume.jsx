import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import charts from './../store/selectors/charts';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisChartVolume extends PureComponent {
  render() {
    return (
      <table>
        <tbody>
          <tr>
            { this.props.volumeChartLabels.map((label, i) => <th key={i}>{label.unix()}</th>) }
          </tr>
          <tr>
            { this.props.volumeChartData.map((label, i) => <td key={i}>{label}</td>) }
          </tr>
        </tbody>
      </table>
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
