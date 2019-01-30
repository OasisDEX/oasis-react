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
                  OasisDex has been shut down. Only order canceling is enabled.
                  Read more <a href="">here [add link!].</a>
                </div>
              </span>
            </li>
            <li>
              <span styleName="Circle Circle--Red">
                <span styleName="FilledCircle" />
              </span>
              <span styleName="Text">
                  Old contract is still <a href="https://old.oasisdex.com">available</a>.
                  Read more <a href="https://en.reddit.com/r/MakerDAO/comments/9z7h2x/an_announcement_from_the_oasis_team/">
                    here.
                  </a>
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
