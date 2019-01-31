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
                <div>
                  OasisDEX.com is shutting down. To trade ETH and DAI, check out our new 
                  marketplace: <a href="https://eth2dai.com/">eth2dai.com</a>. For other pairs
                  you can still use oasisdex.com to cancel your orders. Read
                  more <a href="https://medium.com/makerdao/a-new-oasis-5b9539a64adf">here</a>.
                </div>
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
