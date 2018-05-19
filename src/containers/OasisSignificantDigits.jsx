import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const propTypes = PropTypes && {
  integralColor: PropTypes.string,
  fractionWithNumbersColor: PropTypes.string,
  fractionZeroesColor: PropTypes.string,
  amount: PropTypes.string.isRequired
};

const splitPattern = /^(\d+,?\d*).(\d*[1-9]+|0)?(\d*)$/;
export class OasisSignificantDigitsWrapper extends PureComponent {
  render() {
    const { amount } = this.props;
    const matches = amount.toString().match(splitPattern);
    if(!matches) {
      console.log(amount)
    }
    const [
      ,
      integralPart,
      fractionalPartWitOptionalLeadingZeroes,
      fractionalPartZeroes
    ] = matches;
    return (
      <span>
        <span>{integralPart}</span>
        <span>.</span>
        {fractionalPartWitOptionalLeadingZeroes ? (
          <span>{fractionalPartWitOptionalLeadingZeroes}</span>
        ) : null}
        <span style={{ opacity: 0.5 }}>{fractionalPartZeroes}</span>
      </span>
    );
  }
}

export function mapStateToProps() {
  return {};
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisSignificantDigitsWrapper.propTypes = propTypes;
OasisSignificantDigitsWrapper.displayName = "OasisSignificantDigits";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisSignificantDigitsWrapper
);
