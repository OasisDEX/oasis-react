import BigNumber from "bignumber.js";
import tokens from "../store/selectors/tokens";
import { APP_BASE_PRECISION } from "../constants";

let getState = null;

export function convertToTokenPrecisionInternal(precision, amountIn18Precision) {
  if (precision === APP_BASE_PRECISION) {
    return amountIn18Precision;
  } else {
    const precisionDifference =
      APP_BASE_PRECISION - precision;
    return new BigNumber(amountIn18Precision)
      .times(new BigNumber(10).pow(-precisionDifference))
      .toFixed(0);
  }
}

export function convertToTokenPrecision(amountIn18Precision, tokenName) {
  return convertToTokenPrecisionInternal(
    tokens.getTokenSpecs(getState())(tokenName).get("precision"),
    amountIn18Precision);
}

export function convertTo18PrecisionInternal(precision, amountInTokenPrecision) {

  if (precision === APP_BASE_PRECISION) {
    return amountInTokenPrecision;
  } else {
    return new BigNumber(amountInTokenPrecision)
      .times(
        new BigNumber(10).pow(APP_BASE_PRECISION - precision)
      )
      .toFixed(0);
  }
}

export function convertTo18Precision(amountInTokenPrecision, token) {
  return convertTo18PrecisionInternal(
    tokens.getTokenSpecs(getState())(token).get("precision"),
    amountInTokenPrecision);
}

const init = getStateFunction => (getState = getStateFunction);

export default {
  init
};
