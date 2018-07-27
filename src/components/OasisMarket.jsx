import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

import styles from "./OasisMarket.scss";
import CSSModules from "react-css-modules";
import { createEtherscanAddressLink } from "../utils/createEtherscanTransactionLink";

const propTypes = PropTypes && {
  marketAddress: PropTypes.string,
  networkName: PropTypes.string
};
const defaultProps = {};

export class OasisMarket extends PureComponent {
  render() {
    const { marketAddress, networkName } = this.props;
    const etherscanLink = createEtherscanAddressLink({
      networkName,
      address: marketAddress
    });
    return (
      <div styleName="OasisMarket">
        <span styleName="label"> Market: </span>
        <div styleName="OasisMarketAddress">
          <a target="_blank" rel="noopener noreferrer" href={etherscanLink}>
            {marketAddress}
          </a>
        </div>
      </div>
    );
  }
}

OasisMarket.displayName = "OasisMarket";
OasisMarket.propTypes = propTypes;
OasisMarket.defaultProps = defaultProps;
export default CSSModules(OasisMarket, styles);
