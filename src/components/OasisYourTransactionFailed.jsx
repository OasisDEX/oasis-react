import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisYourTransactionFailed.scss";
import textStyles from '../styles/modules/_typography.scss';
import InfoBox from "./InfoBox";
import { EtherscanLinkWrapper } from "../containers/EtherscanLink";
import { ETHERSCAN_LINK_TYPE_TRANSACTION } from "./EtherscanLink";
import StatusPictogram from './StatusPictogram';
import { TX_STATUS_REJECTED } from '../store/reducers/transactions';
import CSSModules from "react-css-modules/dist/index";

const propTypes = PropTypes && {
  txHash: PropTypes.string.isRequired
};
const defaultProps = {};

class OasisYourTransactionFailed extends PureComponent {
  render() {
    const { txHash } = this.props;
    return (
        <InfoBox color="danger">
            <StatusPictogram status={TX_STATUS_REJECTED}/>
            <span className={styles.infoText}>
              Your transaction
            </span>
            <EtherscanLinkWrapper
              txHash={txHash}
              type={ETHERSCAN_LINK_TYPE_TRANSACTION}
              className={textStyles.spaceBoth}
            /> has failed
        </InfoBox>
    );
  }
}

OasisYourTransactionFailed.displayName = "OasisYourTransactionFailed";
OasisYourTransactionFailed.propTypes = propTypes;
OasisYourTransactionFailed.defaultProps = defaultProps;
export default CSSModules(
  OasisYourTransactionFailed,
  { styles, textStyles },
  { allowMultiple: true }
);
