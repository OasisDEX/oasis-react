import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import OasisTokenWrapFormWrapper from '../containers/OasisTokenWrapForm';
import OasisTokenBalanceWrapper  from '../containers/OasisTokenBalance';
import { TOKEN_ETHER } from '../constants';
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import OasisEtherBalanceWrapper  from '../containers/OasisEtherBalance';
import { WRAP_STATUS_VIEW_TYPE_WRAP, WrapUnwrapStatusWrapper } from '../containers/WrapUnwrapStatus';
import OasisDontWrapAllEther from './OasisDontWrapAllEther';

const propTypes = PropTypes && {
  activeUnwrappedToken: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  activeUnwrappedTokenBalance: PropTypes.object
};
const defaultProps = {};

class OasisWrapUnwrapWrap extends PureComponent {

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

  renderDontWrapAllEtherWarning() {
    const { activeUnwrappedToken, activeUnwrappedTokenBalance } = this.props;
    if(activeUnwrappedToken === TOKEN_ETHER && activeUnwrappedTokenBalance && activeUnwrappedTokenBalance.gt(0)) {
      return (<OasisDontWrapAllEther/>);
    } else { return null; }
  }
  render() {
    const { activeUnwrappedToken } = this.props;
    return (
      <OasisWidgetFrame heading={'Wrap'}>
        <div>
          <b>Wallet </b>{this.getBalance()}
        </div>
        {this.renderDontWrapAllEtherWarning()}
        <OasisTokenWrapFormWrapper
          activeUnwrappedtoken={activeUnwrappedToken}
          onSubmit={this.props.onSubmit}
        />
        <WrapUnwrapStatusWrapper type={WRAP_STATUS_VIEW_TYPE_WRAP}/>
      </OasisWidgetFrame>
    );
  }
}

OasisWrapUnwrapWrap.displayName = 'OasisWrapUnwrapWrap';
OasisWrapUnwrapWrap.propTypes = propTypes;
OasisWrapUnwrapWrap.defaultProps = defaultProps;
export default OasisWrapUnwrapWrap;
