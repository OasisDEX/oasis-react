import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import OasisTokenWrapFormWrapper from "../containers/OasisTokenWrapForm";
import OasisTokenBalanceWrapper from "../containers/OasisTokenBalance";
import { TOKEN_ETHER } from "../constants";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import OasisEtherBalanceWrapper from "../containers/OasisEtherBalance";
import {
  WRAP_STATUS_VIEW_TYPE_WRAP,
  WrapUnwrapStatusWrapper
} from "../containers/WrapUnwrapStatus";
import OasisTokenBalanceSummary from "../containers/OasisTokenBalanceSummary";
import styles from "./OasisWrapUnwrapWrap.scss";
import CSSModules from "react-css-modules";
import {
  TX_WRAP_ETHER,
  TX_WRAP_TOKEN_WRAPPER
} from "../store/reducers/transactions";

const propTypes = PropTypes && {
  activeUnwrappedToken: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  activeUnwrappedTokenBalance: PropTypes.object,
  transactionState: PropTypes.object,
  onFormChange: PropTypes.func.isRequired,
  disableForm: PropTypes.bool,
  hidden: PropTypes.bool.isRequired,
  txType: PropTypes.oneOf([TX_WRAP_ETHER, TX_WRAP_TOKEN_WRAPPER])
};
const defaultProps = {};

class OasisWrapUnwrapWrap extends PureComponent {
  constructor(props) {
    super(props);
    this.onFormChange = this.onFormChange.bind(this);
    this.componentIsUnmounted = false
  }

  getBalance() {
    const { activeUnwrappedToken } = this.props;
    if (activeUnwrappedToken === TOKEN_ETHER) {
      return <OasisEtherBalanceWrapper decimalPlaces={5} fromWei />;
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
    const { disableForm } = this.props;
    return disableForm;
  }

  onFormChange() {
    const { onFormChange, anyTouched } = this.props;
    if (this.componentIsUnmounted === false) {
      onFormChange && onFormChange(anyTouched);
    }
  }

  render() {
    const {
      activeUnwrappedToken,
      hidden,
      txType,
      form,
      transactionState
    } = this.props;
    return (
      <OasisWidgetFrame hidden={hidden} heading={"Wrap"} spaceForContent={true} className={styles.frame}>
        <OasisTokenBalanceSummary summary="Wallet" className={styles.balance}>
          {this.getBalance()}
        </OasisTokenBalanceSummary>
        <OasisTokenWrapFormWrapper
          form={form}
          txType={txType}
          onFormChange={this.onFormChange}
          transactionState={transactionState}
          activeUnwrappedToken={activeUnwrappedToken}
          onSubmit={this.props.onSubmit}
          disabled={this.shouldDisableForm()}
        />
        <WrapUnwrapStatusWrapper type={WRAP_STATUS_VIEW_TYPE_WRAP} />
      </OasisWidgetFrame>
    );
  }

  componentWillUnmount() {
    this.componentIsUnmounted = true;
  }
}

OasisWrapUnwrapWrap.displayName = "OasisWrapUnwrapWrap";
OasisWrapUnwrapWrap.propTypes = propTypes;
OasisWrapUnwrapWrap.defaultProps = defaultProps;
export default CSSModules(OasisWrapUnwrapWrap, styles);
