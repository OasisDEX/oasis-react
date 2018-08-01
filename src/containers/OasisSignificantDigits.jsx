import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Popper, Manager, Reference } from "react-popper";
import web3 from "../bootstrap/web3";

const splitPattern = /^(\d+[,\d]*\d*).(\d*[1-9]+|0)?(\d*)$/;
const popperStyle = style => ({
  ...style,
  padding: "10px",
  background: "#000",
  color: "#fff",
  zIndex: "100"
});

import styles from "./OasisSignificantDigits.scss";
import CSSModules from "react-css-modules";
import { isXXS } from "../utils/ui/responsive";

const propTypes = PropTypes && {
  integralColor: PropTypes.string,
  fractionWithNumbersColor: PropTypes.string,
  fractionZeroesColor: PropTypes.string,
  amount: PropTypes.string.isRequired,
  fullPrecisionAmount: PropTypes.any,
  fractionalZerosGrey: PropTypes.bool,
  fullPrecisionUnit: PropTypes.string
};

const defaultProps = {
  fractionalZerosGrey: true
};

export class OasisSignificantDigitsWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {
      amount,
      fullPrecisionAmount,
      fullPrecisionUnit,
      fractionalZerosGrey
    } = this.props;
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
              <span
                className={
                  fractionalZerosGrey ? styles.paleSignificantDigit : ""
                }
              >
                {fractionalPartZeroes}
              </span>
            </span>
          )}
        </Reference>
        {this.state.showPopup &&
          !isXXS() && (
            <Popper placement="top">
              {({ ref, style, placement }) => (
                <div
                  ref={ref}
                  style={popperStyle(style)}
                  data-placement={placement}
                >
                  {web3
                    .toBigNumber(
                      fullPrecisionUnit
                        ? web3.fromWei(fullPrecisionAmount)
                        : amount.replace(/,/g, "") // TODO: Ugly fix, component should never be given formated string
                    )
                    .toFormat()}
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
OasisSignificantDigitsWrapper.defaultProps = defaultProps;
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModules(OasisSignificantDigitsWrapper, styles)
);
