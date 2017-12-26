import BigNumber from 'bignumber.js';
import tokens from '../store/selectors/tokens';

let getState = null;

export function convertToTokenPrecision(amount, token) {
  if (typeof token !== 'undefined' && token !== '') {
    const tokenSpecs = tokens.getTokenSpecs(getState(), token);
    if (tokenSpecs) {
      let value = amount;
      if (!(amount instanceof BigNumber)) {
        value = new BigNumber(amount);
      }
      return value.times(new BigNumber(10).pow(tokenSpecs.get('precision'))).valueOf();
    }
    throw new Error('Precision not found when converting');
  }
  throw new Error('Token not found when converting');
}

export function convertTo18Precision(amount, token) {
  if (typeof token !== 'undefined' && token !== '') {
    const tokenSpecs = tokens.getTokenSpecs(getState(),token);
    if (tokenSpecs) {
      if (tokenSpecs.precision === 18) {
        return amount;
      }
      let value = amount;
      if (!(amount instanceof BigNumber)) {
        value = new BigNumber(amount);
      }
      return value.times(new BigNumber(10).pow(18 - tokenSpecs.get('precision'))).valueOf();
    }
    throw new Error('Precision not found when converting');
  }
  throw new Error('Token not found when converting');
}

const init = getStateFunction => getState = getStateFunction;

export default  {
  init
}