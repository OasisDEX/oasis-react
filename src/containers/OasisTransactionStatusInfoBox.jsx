import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import textStyles from "../styles/modules/_typography.scss";
import InfoBox from "../components/InfoBox";
import CSSModules from "react-css-modules";
import OasisTransactionStatusWrapper  from "./OasisTransactionStatus";

const propTypes = PropTypes && {
  actions: PropTypes.object,
  txTimestamp: PropTypes.number,
  txType: PropTypes.string,
  localStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  customBlock: PropTypes.node
};

export class OasisTransactionStatusWrapperInfoBox extends PureComponent {

  render() {
    const { infoText, txStatus, ...props } = this.props;
    return txStatus ? (
      <InfoBox justifyContent="space-between" alignItems="baseline" size="sm">
        <div>
          {infoText}
        </div>
        <OasisTransactionStatusWrapper
          {...props}
        />
      </InfoBox>
    ) : null;
  }
}

OasisTransactionStatusWrapperInfoBox.propTypes = propTypes;
OasisTransactionStatusWrapperInfoBox.displayName = "OasisTransactionStatusWrapperInfoBox";
export default CSSModules(OasisTransactionStatusWrapperInfoBox, textStyles);
