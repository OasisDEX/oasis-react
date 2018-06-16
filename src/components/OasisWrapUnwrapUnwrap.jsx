import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import OasisTokenBalanceWrapper from "../containers/OasisTokenBalance";
import OasisTokenUnwrapFormWrapper from "../containers/OasisTokenUnwrapForm";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import {
  WRAP_STATUS_VIEW_TYPE_UNWRAP,
  WrapUnwrapStatusWrapper
} from "../containers/WrapUnwrapStatus";
import OasisTokenBalanceSummary from "../containers/OasisTokenBalanceSummary";
import styles from "./OasisWrapUnwrapUnwrap.scss";
import CSSModules from "react-css-modules";
import { TX_UNWRAP_ETHER, TX_UNWRAP_TOKEN_WRAPPER } from '../store/reducers/transactions';

const propTypes = PropTypes && {
  activeWrappedToken: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  transactionState: PropTypes.object,
  onFormChange: PropTypes.func,
  disableForm: PropTypes.bool,
  hidden: PropTypes.bool.isRequired,
  txType: PropTypes.oneOf([
    TX_UNWRAP_ETHER,
    TX_UNWRAP_TOKEN_WRAPPER
  ])
};
const defaultProps = {};

class OasisWrapUnwrapUnwrap extends PureComponent {
  shouldDisableForm() {
    const { disableForm } = this.props;
    return disableForm;
  }

  constructor(props) {
    super(props);
    this.onFormChange = this.onFormChange.bind(this);
    this.componentIsUnmounted = false;
  }

  onFormChange() {
    const { onFormChange } = this.props;
    if (this.componentIsUnmounted === false) {
      onFormChange && onFormChange();
    }
  }

  render() {
    const {
      activeWrappedToken,
      txType,
      form,
      onSubmit,
      transactionState,
      onFormChange,
      hidden
    } = this.props;
    return (
      <OasisWidgetFrame hidden={hidden} heading={"Unwrap"} spaceForContent={true}>
        <OasisTokenBalanceSummary summary="Wrapped" className={styles.balance}>
          {
            <OasisTokenBalanceWrapper
              decimalPlaces={5}
              tokenName={activeWrappedToken}
            />
          }
        </OasisTokenBalanceSummary>
        <OasisTokenUnwrapFormWrapper
          form={form}
          txType={txType}
          transactionState={transactionState}
          onSubmit={onSubmit}
          onFormChange={onFormChange}
          activeWrappedToken={activeWrappedToken}
          disabled={this.shouldDisableForm()}
        />
        <WrapUnwrapStatusWrapper type={WRAP_STATUS_VIEW_TYPE_UNWRAP} />
      </OasisWidgetFrame>
    );
  }
  componentWillUnmount() {
    this.componentIsUnmounted = true;
  }
}

OasisWrapUnwrapUnwrap.displayName = "OasisWrapUnwrapUnwrap";
OasisWrapUnwrapUnwrap.propTypes = propTypes;
OasisWrapUnwrapUnwrap.defaultProps = defaultProps;
export default CSSModules(OasisWrapUnwrapUnwrap, styles);
