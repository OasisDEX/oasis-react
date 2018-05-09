import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisYourTransactionFailed.scss";
import InfoBox from "./InfoBox";
import InfoBoxBody from "./InfoBoxBody";
import { EthercanLinkWrapper } from "../containers/EtherscanLink";
import { ETHERSCAN_LINK_TYPE_TRANSACTION } from "./EtherscanLink";
import StatusPictogram from './StatusPictogram';
import { TX_STATUS_REJECTED } from '../store/reducers/transactions';

const propTypes = PropTypes && {
  txHash: PropTypes.string.isRequired
};
const defaultProps = {};

class OasisYourTransactionFailed extends PureComponent {
  render() {
    const { txHash } = this.props;
    return (
      <div className={styles.base}>
        <InfoBox className="danger">
          <InfoBoxBody>
            <StatusPictogram status={TX_STATUS_REJECTED}/>
            Your transaction
            <EthercanLinkWrapper
              txHash={txHash}
              type={ETHERSCAN_LINK_TYPE_TRANSACTION}
            /> has failed
          </InfoBoxBody>
        </InfoBox>
      </div>
    );
  }
}

OasisYourTransactionFailed.displayName = "OasisYourTransactionFailed";
OasisYourTransactionFailed.propTypes = propTypes;
OasisYourTransactionFailed.defaultProps = defaultProps;
export default OasisYourTransactionFailed;
