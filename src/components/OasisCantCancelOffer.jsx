import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import InfoBox from "./InfoBox";
// import ImmutablePropTypes from 'react-immutable-proptypes';

// import styles from './OasisCantCancelOffer.scss';

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisCantCancelOffer extends PureComponent {
  render() {
    return (
      <InfoBox color="danger">
        This offer has been taken. You cannot cancel it anymore.
      </InfoBox>
    );
  }
}

OasisCantCancelOffer.displayName = "OasisCantCancelOffer";
OasisCantCancelOffer.propTypes = propTypes;
OasisCantCancelOffer.defaultProps = defaultProps;
export default OasisCantCancelOffer;
