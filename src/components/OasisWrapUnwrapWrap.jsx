import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import OasisTokenWrapFormWrapper from '../containers/OasisTokenWrapForm';
import OasisTokenBalanceWrapper  from '../containers/OasisTokenBalance';
import { TOKEN_ETHER } from '../constants';
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import OasisEtherBalanceWrapper  from '../containers/OasisEtherBalance';
import { WRAP_STATUS_VIEW_TYPE_WRAP, WrapUnwrapStatusWrapper } from '../containers/WrapUnwrapStatus';
import OasisTokenBalanceSummary from '../containers/OasisTokenBalanceSummary';
import styles from './OasisWrapUnwrapWrap.scss';
import CSSModules from 'react-css-modules';
import { TX_STATUS_CANCELLED_BY_USER } from '../store/reducers/transactions';

const propTypes = PropTypes && {
  activeUnwrappedToken: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  activeUnwrappedTokenBalance: PropTypes.object,
  transactionState: PropTypes.object,
  onFormChange: PropTypes.func.isRequired
};
const defaultProps = {};

class OasisWrapUnwrapWrap extends PureComponent {


  constructor(props) {
    super(props);
    this.onFormChange = this.onFormChange.bind(this);
  }

  getBalance() {
    const { activeUnwrappedToken } = this.props;
    if (activeUnwrappedToken === TOKEN_ETHER) {
      return (
        <OasisEtherBalanceWrapper decimalPlaces={5} fromWei/>
      );
    } else {
      return (
        <OasisTokenBalanceWrapper
          decimalPlaces={5}
          tokenName={activeUnwrappedToken}
        />
      );
    }
  }


  shouldDisableForm() {
    const { transactionState: { txStatus } = {} } = this.props;
    return txStatus && txStatus !== TX_STATUS_CANCELLED_BY_USER;
  }

  onFormChange() {
   const { onFormChange } = this.props;
    onFormChange && onFormChange();
  }

  render() {
    const { activeUnwrappedToken, transactionState } = this.props;
    return (
      <OasisWidgetFrame heading={'Wrap'} spaceForContent={true}>
        <OasisTokenBalanceSummary summary="Wallet">
          {this.getBalance()}
        </OasisTokenBalanceSummary>
        <OasisTokenWrapFormWrapper
          onFormChange={this.onFormChange}
          transactionState={transactionState}
          activeUnwrappedToken={activeUnwrappedToken}
          onSubmit={this.props.onSubmit}
          disabled={this.shouldDisableForm()}
        />
        <WrapUnwrapStatusWrapper type={WRAP_STATUS_VIEW_TYPE_WRAP}/>
      </OasisWidgetFrame>
    );
  }
}

OasisWrapUnwrapWrap.displayName = 'OasisWrapUnwrapWrap';
OasisWrapUnwrapWrap.propTypes = propTypes;
OasisWrapUnwrapWrap.defaultProps = defaultProps;
export default CSSModules(OasisWrapUnwrapWrap, styles);
