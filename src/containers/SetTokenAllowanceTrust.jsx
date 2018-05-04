import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import balances from "../store/selectors/balances";
import balancesReducer from "../store/reducers/balances";
import platform from "../store/selectors/platform";
import OasisButton from "../components/OasisButton";
import { InfoBox } from "../components/InfoBox";
import { InfoBoxBody } from "../components/InfoBoxBody";
import OasisAccordion from "../components/OasisAccordion";
import OasisTransactionStatusWrapper from "./OasisTransactionStatus";
import { TX_ALLOWANCE_TRUST_TOGGLE } from "../store/reducers/transactions";
import network from "../store/selectors/network";
import FlexBox from "../components/FlexBox";
import {
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED,
  TOKEN_ALLOWANCE_TRUST_STATUS_LOADING,
} from '../constants';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  subjectTrustStatus: PropTypes.bool,
  tokenName: PropTypes.string.isRequired,
  allowanceSubjectAddress: PropTypes.string.isRequired,
  isToggleEnabled: PropTypes.bool,
  onTransactionPending: PropTypes.func,
  onTransactionCompleted: PropTypes.func,
  onCancelCleanup: PropTypes.func
};

export class SetTokenAllowanceTrustWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};

    this.toggleTokenAllowanceTrustStatus = this.toggleTokenAllowanceTrustStatus.bind(
      this
    );
    this.getAllowanceStatus();
  }

  getAllowanceStatus(nextProps) {
    const {
      actions: { getDefaultAccountTokenAllowanceForAddress },
      tokenName,
      allowanceSubjectAddress
    } = this.props;

    if (
      nextProps &&
      nextProps.contractsLoaded &&
      nextProps.subjectTrustStatus == null
    ) {
      getDefaultAccountTokenAllowanceForAddress(
        tokenName,
        allowanceSubjectAddress
      );
    }
  }

  setTokenAllowanceTrustStatus(newAllowanceTrustStatus) {
    const {
      tokenName,
      allowanceSubjectAddress,
      actions: { setTokenAllowanceTrustStatus }
    } = this.props;

    this.setState({ disableActionDispatchButton: true });

    return setTokenAllowanceTrustStatus(
      {
        tokenName,
        newAllowanceTrustStatus,
        allowanceSubjectAddress
      },
      {
        onPending: this.onTransactionPending.bind(this),
        onCompleted: this.onTransactionCompleted.bind(this),
        onCancelCleanup: this.onUserCancel.bind(this)
      }
    );
  }

  onTransactionPending(txStartTimestamp) {
    this.setState({ txTimestamp: txStartTimestamp });
    this.props.onTransactionPending();
  }

  onTransactionCompleted() {
    this.setState({ disableActionDispatchButton: false });
    this.props.onTransactionCompleted();
  }

  onUserCancel() {
    this.setState({ disableActionDispatchButton: false });
    this.props.onCancelCleanup();
  }

  toggleTokenAllowanceTrustStatus() {
    const { subjectTrustStatus } = this.props;
    if (subjectTrustStatus === TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED) {
      this.setTokenAllowanceTrustStatus(TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED);
    } else if (subjectTrustStatus === TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED) {
      this.setTokenAllowanceTrustStatus(TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED);
    }
  }

  getLabel() {
    if (this.isAllowanceLoading()) {
      return "Loading";
    } else if (this.props.isToggleEnabled) {
      return this.isAllowanceEnabled() ? "Disable" : "Enable";
    } else {
      return "Enable";
    }
  }

  renderTransactionInfo() {
    const { txTimestamp } = this.state;
    return txTimestamp ? (
      <OasisTransactionStatusWrapper
        txTimestamp={txTimestamp}
        txType={TX_ALLOWANCE_TRUST_TOGGLE}
      />
    ) : null;
  }

  isAllowanceEnabled() {
    return (
      this.props.subjectTrustStatus === TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED
    );
  }

  isAllowanceLoading() {
    return (
      this.props.subjectTrustStatus === TOKEN_ALLOWANCE_TRUST_STATUS_LOADING ||
      this.props.subjectTrustStatus === undefined
    );
  }

  shouldDisplay() {
    return this.isAllowanceLoading()
      ? false
      : this.props.isToggleEnabled ? true : !this.isAllowanceEnabled();
  }

  mainInfoBoxContent() {
    return (
      <OasisAccordion isOpen={true} heading={this.renderAccordionHeading()}>
        {this.renderAccordionContent()}
      </OasisAccordion>
    );
  }

  shouldDisableActionDispatch() {
    const { disableActionDispatchButton } = this.state;
    const { isToggleEnabled } = this.props;
    const disable = disableActionDispatchButton
      ? disableActionDispatchButton
      : isToggleEnabled ? false : this.isAllowanceEnabled();
    return disable;
  }

  renderAccordionHeading() {
    const isAllowanceEnabled = this.isAllowanceEnabled();
    const prefix = !this.props.isToggleEnabled
      ? "Enable"
      : isAllowanceEnabled ? "Disable" : "Enable";
    return (
      <FlexBox alignContent="space-between">
        <span>
          {prefix} <b>{this.props.tokenName}</b> for trading
        </span>
        <OasisButton
          onClick={this.toggleTokenAllowanceTrustStatus}
          size="md"
          disabled={this.shouldDisableActionDispatch()}
          color={
            isAllowanceEnabled || this.shouldDisableActionDispatch()
              ? "default"
              : "success"
          }
        >
          {this.getLabel()}
        </OasisButton>
      </FlexBox>
    );
  }

  renderAccordionContent() {
    return !this.state.txTimestamp ? (
      <div hidden={this.isAllowanceEnabled()}>
        You need first grant access to withdraw from your personal account. To
        disable {this.props.tokenName} trading use Allowance widget on the funds
        page.
      </div>
    ) : (
      <div>{this.renderTransactionInfo()}</div>
    );
  }

  render() {
    return (
      <div hidden={!this.shouldDisplay()}>
        <InfoBox justifyContent="space-between">
          <InfoBoxBody>{this.mainInfoBoxContent()}</InfoBoxBody>
        </InfoBox>
      </div>
    );
  }
}

export function mapStateToProps(state, { allowanceSubjectAddress, tokenName }) {
  return {
    subjectTrustStatus: balances.tokenAllowanceTrustStatus(state, {
      allowanceSubjectAddress,
      tokenName
    }),
    contractsLoaded: platform.contractsLoaded(state),
    latestBlockNumber: network.latestBlockNumber(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setTokenAllowanceTrustStatus:
      balancesReducer.actions.setTokenAllowanceTrustEpic,
    getDefaultAccountTokenAllowanceForAddress:
      balancesReducer.actions.getDefaultAccountTokenAllowanceForAddress
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

SetTokenAllowanceTrustWrapper.propTypes = propTypes;
SetTokenAllowanceTrustWrapper.displayName = "SetTokenAllowanceTrust";
export default connect(mapStateToProps, mapDispatchToProps)(
  SetTokenAllowanceTrustWrapper
);
