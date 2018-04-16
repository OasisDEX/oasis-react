import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';
// import ImmutablePropTypes from 'react-immutable-proptypes';

// import styles from './OasisChart.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisChart extends PureComponent {
  render() {
    return (
        <OasisWidgetFrame heading="Charts">
          <div>To be continued...</div>
        </OasisWidgetFrame>
    );
  }
}

OasisChart.displayName = 'OasisChart';
OasisChart.propTypes = propTypes;
OasisChart.defaultProps = defaultProps;
export default OasisChart;
