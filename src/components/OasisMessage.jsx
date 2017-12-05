import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import styles from './OasisMessage.scss';
import CSSModules from 'react-css-modules';

export const MSGTYPE_INFO = 'MSGTYPE_INFO';
export const MSGTYPE_WARNING = 'MSGTYPE_WARNING';

const BOARD_TYPE = {
  [MSGTYPE_INFO]: "MessageBoard--Info",
  [MSGTYPE_WARNING]: "MessageBoard--Warning",
};

const propTypes = PropTypes && {
  children: PropTypes.node.isRequired,
  heading: PropTypes.string.isRequired,
  type: PropTypes.oneOf([MSGTYPE_INFO, MSGTYPE_WARNING]),
};
const defaultProps = {};

class OasisMessage extends PureComponent {
  render() {
    return (
      <div styleName={`MessageBoard ${BOARD_TYPE[this.props.type]}`}>
        <h3 styleName="Heading">
          {this.props.heading}

          <span styleName="Close"/>
        </h3>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

OasisMessage.displayName = 'OasisMessage';
OasisMessage.propTypes = propTypes;
OasisMessage.defaultProps = defaultProps;
export default CSSModules(OasisMessage, styles, {allowMultiple: true});
