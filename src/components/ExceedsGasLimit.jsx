import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

const propTypes = PropTypes && {
};
const defaultProps = {};


class ExceedsGasLimit extends PureComponent {
  render() {
    return (
      <div>
        <div>
          Your order exceed gas limit of <b>4.3 Million</b>.
        </div>
        <div>
          To get a working order use the <b>Buy Max Button</b>
        </div>
      </div>
    );
  }
}

ExceedsGasLimit.displayName = 'ExceedsGasLimit';
ExceedsGasLimit.propTypes = propTypes;
ExceedsGasLimit.defaultProps = defaultProps;
export default ExceedsGasLimit;
