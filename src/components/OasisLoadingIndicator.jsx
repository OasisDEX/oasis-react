import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import OasisIcon from "./OasisIcon";
// import ImmutablePropTypes from 'react-immutable-proptypes';

const propTypes = PropTypes && {
  size: PropTypes.string,
  marginLeft: PropTypes.string,
  marginRight: PropTypes.string
};
const defaultProps = {};

class OasisLoadingIndicator extends PureComponent {
  render() {
    const { marginLeft = 0, marginRight = 0, size } = this.props;
    const style = {
      display: "inline-block",
      marginLeft,
      marginRight
    };
    return (
      <span style={style}>
        <OasisIcon size={size ? size: 'sm'} icon="loading" />
      </span>
    );
  }
}

OasisLoadingIndicator.displayName = "OasisLoadingIndicator";
OasisLoadingIndicator.propTypes = propTypes;
OasisLoadingIndicator.defaultProps = defaultProps;
export default OasisLoadingIndicator;
