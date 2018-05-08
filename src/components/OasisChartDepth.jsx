import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import charts from './../store/selectors/charts';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisChartDepth extends PureComponent {
  render() {
    return (
      <p>TODO</p>
    );
  }
}

export function mapStateToProps() {
  return {
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisChartDepth.displayName = 'OasisChartDepth';
OasisChartDepth.propTypes = propTypes;
OasisChartDepth.defaultProps = defaultProps;
export default connect(mapStateToProps)(OasisChartDepth);
