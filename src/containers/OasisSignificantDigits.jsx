import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Popper, Manager, Reference } from "react-popper";
import web3 from '../bootstrap/web3';

const propTypes = PropTypes && {
  integralColor: PropTypes.string,
  fractionWithNumbersColor: PropTypes.string,
  fractionZeroesColor: PropTypes.string,
  amount: PropTypes.string.isRequired,
  fullPrecisionAmount: PropTypes.any,
  fullPrecisionUnit: PropTypes.string
};

const splitPattern = /^(\d+,?\d*).(\d*[1-9]+|0)?(\d*)$/;
export class OasisSignificantDigitsWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { amount, fullPrecisionAmount, fullPrecisionUnit } = this.props;
    const matches = amount.toString().match(splitPattern);
    if (!matches) {
      console.log(amount);
    }
    const [
      ,
      integralPart,
      fractionalPartWitOptionalLeadingZeroes,
      fractionalPartZeroes
    ] = matches;
    return (
      <Manager>
        <Reference>
          {({ ref }) => (
            <span
              ref={ref}
              onMouseOver={() => this.setState({ showPopup: true })}
              onMouseOut={() => this.setState({ showPopup: false })}
            >
              <span>{integralPart}</span>
              <span>.</span>
              {fractionalPartWitOptionalLeadingZeroes ? (
                <span>{fractionalPartWitOptionalLeadingZeroes}</span>
              ) : null}
              <span style={{ opacity: 0.5 }}>{fractionalPartZeroes}</span>
            </span>
          )}
        </Reference>
        {this.state.showPopup && (
          <Popper placement="top">
            {({ ref, style, placement }) => (
              <div
                ref={ref}
                style={{ ...style, padding: "10px", background: "#000", color: '#fff', zIndex: '100' }}
                data-placement={placement}
              >
                {web3.toBigNumber( fullPrecisionUnit ? web3.fromWei(fullPrecisionAmount): fullPrecisionAmount ).toFixed()}
              </div>
            )}
          </Popper>
        )}
      </Manager>
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
