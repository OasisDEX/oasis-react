import BigNumber from 'bignumber.js';

export default function(n, dp = 5) {
  if (isNaN(+n)) return;
  const bn = new BigNumber(n);
  return bn.toFormat(dp);
};