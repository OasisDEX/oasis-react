import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import styles from './OasisMessage.scss';
import CSSModules from 'react-css-modules';

export const MSGTYPE_INFO = 'MSGTYPE_INFO';
export const MSGTYPE_WARNING = 'MSGTYPE_WARNING';

const BOARD_TYPE = {
  [MSGTYPE_INFO]: 'MessageBoard--Info',
  [MSGTYPE_WARNING]: 'MessageBoard--Warning',
};

const propTypes = PropTypes && {
  children: PropTypes.node.isRequired,
  heading: PropTypes.string.isRequired,
  type: PropTypes.oneOf([MSGTYPE_INFO, MSGTYPE_WARNING]),
  dismissible: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func
};
const defaultProps = {
  dismissible: false,
};

export class OasisMessage extends PureComponent {
  constructor(props) {
    super(props);
    this.onDismiss = this.onDismiss.bind(this);
  }

  onDismiss() {
    const { type } = this.props;
    this.props.onDismiss(type);
  }

  render() {
    const { dismissible, hidden } = this.props;
    return (
      <div hidden={hidden} styleName={`MessageBoard ${BOARD_TYPE[this.props.type]}`}>
        <h3 styleName="Heading">
          {this.props.heading}
          {dismissible && <span onClick={this.onDismiss} styleName="Close"/>}
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
export default CSSModules(OasisMessage, styles, { allowMultiple: true });
