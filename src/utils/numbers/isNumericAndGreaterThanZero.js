import web3 from '../../bootstrap/web3';

const isNumericAndGreaterThanZero = n => !isNaN(parseFloat(n)) && isFinite(n) && web3.toBigNumber(n).gt(0);

export default isNumericAndGreaterThanZero;