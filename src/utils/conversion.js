import BigNumber from "bignumber.js";
import tokens from "../store/selectors/tokens";
import { APP_BASE_PRECISION } from "../constants";

let getState = null;

export function convertToTokenPrecision(amountIn18Precision, tokenName) {
  const tokenSpecs = tokens.getTokenSpecs(getState(), tokenName);
  if (tokenSpecs.get("precision") === APP_BASE_PRECISION) {
    return amountIn18Precision;
  } else {
    const precisionDifference =
      APP_BASE_PRECISION - tokenSpecs.get("precision");
    return new BigNumber(amountIn18Precision)
      .times(new BigNumber(10).pow(-precisionDifference))
      .toFixed(0);
  }
}

export function convertTo18Precision(amountInTokenPrecision, token) {
  const tokenSpecs = tokens.getTokenSpecs(getState(), token);
  if (tokenSpecs.get("precision") === APP_BASE_PRECISION) {
    return amountInTokenPrecision;
  } else {
    return new BigNumber(amountInTokenPrecision)
      .times(
        new BigNumber(10).pow(APP_BASE_PRECISION - tokenSpecs.get("precision"))
      )
      .toFixed(0);
  }
}

const init = getStateFunction => (getState = getStateFunction);

export default {
  init
};
