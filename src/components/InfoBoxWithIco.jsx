import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import styles from "./InfoBoxWithIco.scss";
import CSSModules from "react-css-modules/dist/index";
import InfoBox from "./InfoBox";
import OasisIcon from '../components/OasisIcon';

const propTypes = PropTypes && {
  children: PropTypes.node,
  icon: PropTypes.string,
  alignItems: PropTypes.string,
  additionalStyles: PropTypes.object
};

const defaultProps = {
  alignItems: "center"
};

export class InfoBoxWithIco extends PureComponent {
  render() {
    const {
      icon,
      ...props
    } = this.props;
    return (
      <InfoBox {...props}>
        <OasisIcon icon={icon} />
        <div className={styles.infoText}>
          {this.props.children}
        </div>
      </InfoBox>
    );
  }
}

InfoBoxWithIco.displayName = "InfoBoxWithIco";
InfoBoxWithIco.propTypes = propTypes;
InfoBoxWithIco.defaultProps = defaultProps;
export default CSSModules(InfoBoxWithIco, styles);
