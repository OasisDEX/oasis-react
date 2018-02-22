import web3 from '../../bootstrap/web3';


const normalize =
  (value, previousValue) =>
    parseFloat(value) === 0 ? value :
      !isFinite(value) ? previousValue: value.replace(/[^\d.-]/g, '').toString();

const formatValue = (value) =>  isFinite(value) ?  web3.toBigNumber(value).toFormat(5): 'its not finite';



const numericFormatValidator = value => {
  if(!/^(\d+\.?\d*|\.\d+)$/.test(value)) {
    return `VALIDATOR_ERROR/NOT_NUMERIC_FORMAT`;
  }
};

const greaterThanZeroValidator = value => {
  if(!(isFinite(value) && web3.toBigNumber(value).gt(0)) ) {
    return `VALIDATOR_ERROR/MUST_BE_GREATER_THAN_ZERO`;
  }
};


export {
  normalize,
  formatValue,
  numericFormatValidator,
  greaterThanZeroValidator
}