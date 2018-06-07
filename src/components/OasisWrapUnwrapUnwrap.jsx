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

const propTypes = PropTypes && {
  activeWrappedToken: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  transactionState: PropTypes.object,
  onFormChange: PropTypes.func,
  disableForm: PropTypes.bool
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
  }

  onFormChange() {
     const { onFormChange } = this.props;
     onFormChange && onFormChange();
  }

  render() {
    const { activeWrappedToken, onSubmit, transactionState, onFormChange } = this.props;
    return (
      <OasisWidgetFrame
        heading={"Unwrap"}
        spaceForContent={true}
      >
        <OasisTokenBalanceSummary summary="Wrapped" className={styles.balance}>
          {
            <OasisTokenBalanceWrapper
              decimalPlaces={5}
              tokenName={activeWrappedToken}
            />
          }
        </OasisTokenBalanceSummary>
        <OasisTokenUnwrapFormWrapper
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
}

OasisWrapUnwrapUnwrap.displayName = "OasisWrapUnwrapUnwrap";
OasisWrapUnwrapUnwrap.propTypes = propTypes;
OasisWrapUnwrapUnwrap.defaultProps = defaultProps;
export default CSSModules(OasisWrapUnwrapUnwrap, styles);
