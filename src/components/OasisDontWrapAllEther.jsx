import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import styles from "./OasisDontWrapAllEther.scss";
import CSSModules from "react-css-modules/dist/index";
import { InfoBoxWithIco } from "./InfoBoxWithIco";

const propTypes = PropTypes && {
  noBorder: PropTypes.bool
};
const defaultProps = {};

class OasisDontWrapAllEther extends PureComponent {
  render() {
    const { noBorder, ...props } = this.props;
    const tokenName = "ETH";
    return (
      <InfoBoxWithIco
        noBorder={noBorder}
        color="danger"
        icon="warning"
        {...props}
      >
        <span className={styles.base}>
          Do not wrap all of your <b>{tokenName}</b>!
        </span>
      </InfoBoxWithIco>
    );
  }
}

OasisDontWrapAllEther.displayName = "OasisDontWrapAllEther";
OasisDontWrapAllEther.propTypes = propTypes;
OasisDontWrapAllEther.defaultProps = defaultProps;
export default CSSModules(OasisDontWrapAllEther, styles);
