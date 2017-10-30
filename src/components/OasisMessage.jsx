import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import './OasisMessage.scss';

export const MSGTYPE_INFO = 'MSGTYPE_INFO';
export const MSGTYPE_WARNING = 'MSGTYPE_WARNING';
export const MSGTYPE_ERROR = 'MSGTYPE_ERROR';


const propTypes = PropTypes && {
  children: PropTypes.node.isRequired,
  heading: PropTypes.string.isRequired,
  type: PropTypes.oneOf([MSGTYPE_INFO, MSGTYPE_WARNING, MSGTYPE_ERROR])
};
const defaultProps = {};


class OasisMessage extends PureComponent {
  render() {
    return (
      <div className="OasisMessage">
        <div className="OasisMessageBody">
          {this.props.children}
        </div>
      </div>
    );
  }
}

OasisMessage.displayName = 'OasisMessage';
OasisMessage.propTypes = propTypes;
OasisMessage.defaultProps = defaultProps;
export default OasisMessage;
