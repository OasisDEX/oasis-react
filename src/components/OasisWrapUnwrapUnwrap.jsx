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
  transactionState: PropTypes.object
};
const defaultProps = {};

class OasisWrapUnwrapUnwrap extends PureComponent {
  render() {
    const { activeWrappedToken, onSubmit, transactionState } = this.props;
    return (
      <OasisWidgetFrame heading={"Unwrap"} spaceForContent={true} className={styles.widgetFrame}>
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
          activeWrappedToken={activeWrappedToken}
          disabled={!!transactionState.txStatus}
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
