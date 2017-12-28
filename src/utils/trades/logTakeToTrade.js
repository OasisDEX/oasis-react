import getTokenByAddress from '../tokens/getTokenByAddress';
import { convertTo18Precision } from '../conversion';

export default (logTake) => {
  const buyWhichToken = getTokenByAddress(logTake.args.buy_gem);
  const sellWhichToken = getTokenByAddress(logTake.args.pay_gem);
  if (buyWhichToken && sellWhichToken && !logTake.removed) {
    return {
      buyWhichToken_address: logTake.args.buy_gem,
      buyWhichToken,
      sellWhichToken_address: logTake.args.pay_gem,
      sellWhichToken,
      buyHowMuch: convertTo18Precision(logTake.args.give_amt.toString(10), buyWhichToken),
      sellHowMuch: convertTo18Precision(logTake.args.take_amt.toString(10), sellWhichToken),
      timestamp: logTake.args.timestamp.toNumber(),
      transactionHash: logTake.transactionHash,
      issuer: logTake.args.maker,
      counterParty: logTake.args.taker,
    };
  }
  return false;
}