import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

// import styles from './OasisDontWrapAllEther.scss';
import { InfoBox } from "./InfoBox";
import { OasisIcon } from "./OasisIcon";
import styles from "./OasisDontWrapAllEther.scss";
import CSSModules from "react-css-modules/dist/index";

const propTypes = PropTypes && {};
const defaultProps = {};

class OasisDontWrapAllEther extends PureComponent {
  render() {
    return (
      <InfoBox color="danger" alignItems="center" {...this.props}>
          <OasisIcon
            icon="warning"
            title="Otherwise you will not be able to pay for transactions."
            className={styles.warningIco}
          />
          <span className={styles.text}>
          Do not wrap all of your <b className={styles.tokenName}>ETH</b> !
        </span>
      </InfoBox>
    );
  }
}

OasisDontWrapAllEther.displayName = "OasisDontWrapAllEther";
OasisDontWrapAllEther.propTypes = propTypes;
OasisDontWrapAllEther.defaultProps = defaultProps;
export default CSSModules(OasisDontWrapAllEther, styles);
