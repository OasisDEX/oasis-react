import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { MSGTYPE_WARNING } from "./OasisMessage";
import OasisMessage from "./OasisMessage";

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisTestingWarningMessage extends PureComponent {
  render() {
    return (
      <OasisMessage type={MSGTYPE_WARNING} heading={"Warning!"}>
        <div>
          <ul>
            <li>
              <span styleName="Circle Circle--Red">
                <span styleName="FilledCircle" />
              </span>
              <span styleName="Text">
                Oasis is undergoing alpha testing: Any funds deposited on the
                exchange could be lost in the event of a security breach.
              </span>
            </li>
          </ul>
        </div>
      </OasisMessage>
    );
  }
}

OasisTestingWarningMessage.displayName = "OasisTestingWarningMessage";
OasisTestingWarningMessage.propTypes = propTypes;
OasisTestingWarningMessage.defaultProps = defaultProps;
export default OasisTestingWarningMessage;
