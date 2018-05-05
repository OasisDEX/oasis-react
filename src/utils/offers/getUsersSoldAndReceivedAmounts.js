import web3 from '../../bootstrap/web3';
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../../store/reducers/offerTakes';
import { formatAmount } from '../tokens/pair';
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../../constants';

const getUsersSoldAndReceivedAmounts = (offerType, offerFormValues) => {
  if (!offerFormValues || !offerFormValues.get('price') || !offerFormValues.get('total') || !offerFormValues.get('volume')) {
    return { amountReceived: 'N/A', amountSold: 'N/A' };
  }

  const volumeBN = web3.toBigNumber(offerFormValues.get('volume'));
  const totalBN = web3.toBigNumber(offerFormValues.get('total'));

  switch (offerType) {
    case TAKE_SELL_OFFER:
      return {
        amountReceived: formatAmount(volumeBN, false, null, 5), amountSold: formatAmount(totalBN, false, null, 5),
      };
    case TAKE_BUY_OFFER:
      return {
        amountReceived: formatAmount(totalBN, false, null, 5), amountSold: formatAmount(volumeBN, false, null, 5),
      };

    case MAKE_SELL_OFFER:
      return {
        amountSold: formatAmount(volumeBN, false, null, 5), amountReceived: formatAmount(totalBN, false, null, 5),
      };
    case MAKE_BUY_OFFER:
      return {
        amountSold: formatAmount(totalBN, false, null, 5), amountReceived: formatAmount(volumeBN, false, null, 5),
      };

  }
};

export default getUsersSoldAndReceivedAmounts;