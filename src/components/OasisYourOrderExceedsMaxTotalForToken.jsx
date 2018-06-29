import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import InfoBoxWithIco from "./InfoBoxWithIco";
import styles from './OasisYourOrderExceedsMaxTotalForToken.scss';
const propTypes = PropTypes && {
  noBorder: PropTypes.bool
};
const defaultProps = {};

class OasisYourOrderExceedsMaxTotalForToken extends PureComponent {
  render() {
    const { noBorder } = this.props;
    return (
      <InfoBoxWithIco noBorder={noBorder} color="danger" icon="warning">
        <span className={`${noBorder ? styles.noBorder: ''}`}>
          Your order total exceeds max order total set for this token
        </span>
      </InfoBoxWithIco>
    );
  }
}

OasisYourOrderExceedsMaxTotalForToken.displayName =
  "OasisYourOrderExceedsMaxTotalForToken";
OasisYourOrderExceedsMaxTotalForToken.propTypes = propTypes;
OasisYourOrderExceedsMaxTotalForToken.defaultProps = defaultProps;
export default OasisYourOrderExceedsMaxTotalForToken;
