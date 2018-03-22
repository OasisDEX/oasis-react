import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisLoadingIndicator extends PureComponent {
  render() {
    return (
      <span style={{ fontSize: 10 }}>[L]</span>
    );
  }
}

OasisLoadingIndicator.displayName = 'OasisLoadingIndicator';
OasisLoadingIndicator.propTypes = propTypes;
OasisLoadingIndicator.defaultProps = defaultProps;
export default OasisLoadingIndicator;
