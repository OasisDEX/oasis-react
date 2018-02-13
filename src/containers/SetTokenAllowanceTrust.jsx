import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import balances from '../store/selectors/balances';
import balancesReducer, {
  TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED, TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED,
} from '../store/reducers/balances';
import platform from '../store/selectors/platform';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  subjectTrustStatus: PropTypes.bool,
  tokenName: PropTypes.string.isRequired,
  allowanceSubjectAddress: PropTypes.string.isRequired
};

export class SetTokenAllowanceTrustWrapper extends PureComponent {

  constructor(props) {
    super(props);
    this.toggleTokenAllowanceTrustStatus = this.toggleTokenAllowanceTrustStatus.bind(this);
    this.getAllowanceStatus();
  }

  getAllowanceStatus(nextProps) {
    const {
      actions: { getDefaultAccountTokenAllowanceForAddress },
      tokenName,
      allowanceSubjectAddress
    } = this.props;

    if(nextProps && nextProps.contractsLoaded && nextProps.subjectTrustStatus == null) {
      getDefaultAccountTokenAllowanceForAddress( tokenName, allowanceSubjectAddress);
    } else {
      getDefaultAccountTokenAllowanceForAddress( tokenName, allowanceSubjectAddress)
    }
  }

  componentWillUpdate(nextProps) {
    this.getAllowanceStatus(nextProps);
  }

  setTokenAllowanceTrustStatus(newAllowanceTrustStatus) {

    const {
      tokenName,
      allowanceSubjectAddress
    } = this.props;

    this.props.actions.setTokenAllowanceTrustStatus(
      tokenName, newAllowanceTrustStatus, allowanceSubjectAddress
    );
  }

  toggleTokenAllowanceTrustStatus() {
    const { subjectTrustStatus } = this.props;
    if(subjectTrustStatus === TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED) {
      this.setTokenAllowanceTrustStatus(TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED);
    } else if (subjectTrustStatus === TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED) {
      this.setTokenAllowanceTrustStatus(TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED)
    }
  }


  render() {
    const { subjectTrustStatus } = this.props;
    let btnLabel;
    switch (subjectTrustStatus) {
      case null: btnLabel = 'Loading';break;
      case TOKEN_ALLOWANCE_TRUST_STATUS_DISABLED: btnLabel = 'Enable';break;
      case TOKEN_ALLOWANCE_TRUST_STATUS_ENABLED: btnLabel = 'Disable';break;
    }

    return (
      <div>
        <h1>{subjectTrustStatus}</h1>
        <button onClick={this.toggleTokenAllowanceTrustStatus}>{btnLabel}</button>
      </div>
    );
  }
}

export function mapStateToProps(props, { allowanceSubjectAddress, tokenName }) {
  return {
    subjectTrustStatus: balances.tokenAllowanceTrustStatus(props, { allowanceSubjectAddress, tokenName }),
    contractsLoaded: platform.contractsLoaded(props)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    setTokenAllowanceTrustStatus: balancesReducer.actions.setTokenAllowanceTrustEpic,
    getDefaultAccountTokenAllowanceForAddress: balancesReducer.actions.getDefaultAccountTokenAllowanceForAddress
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

SetTokenAllowanceTrustWrapper.propTypes = propTypes;
SetTokenAllowanceTrustWrapper.displayName = 'SetTokenAllowanceTrust';
export default connect(mapStateToProps, mapDispatchToProps)(SetTokenAllowanceTrustWrapper);
