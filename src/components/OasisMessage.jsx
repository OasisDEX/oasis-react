import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisMessage.scss';


const propTypes = PropTypes && {
};
const defaultProps = {};


class OasisMessage extends PureComponent {
  render() {
    return (
      <div className="OasisMessage">
      </div>
    );
  }
}

OasisMessage.displayName = 'OasisMessage';
OasisMessage.propTypes = propTypes;
OasisMessage.defaultProps = defaultProps;
export default OasisMessage;
