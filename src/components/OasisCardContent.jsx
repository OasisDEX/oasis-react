import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisCardContent.scss';


const propTypes = PropTypes && {
  children: PropTypes.node,
  heading: PropTypes.string.isRequired
};
const defaultProps = {};


class OasisCardContent extends PureComponent {
  render() {
    const { heading } = this.props;
    return (
        <div>
          <h2>{heading}</h2>
          <div className="OasisCardContent">
            {this.props.children}
          </div>
        </div>
    );
  }
}

OasisCardContent.displayName = 'OasisCardContent';
OasisCardContent.propTypes = propTypes;
OasisCardContent.defaultProps = defaultProps;
export default OasisCardContent;
