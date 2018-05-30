import {getMarketContractInstance} from '../../../bootstrap/contracts';
import {createAction} from 'redux-actions';

/**
 * New offer is filled in
 * - sync offer
 *
 */
const newOfferFilledIn = createAction('OFFERS/NEW_OFFER_FILLED_IN', offerId => offerId);
export const subscribeNewOffersFilledInEpic = (fromBlock, filter = {}, {
  doGetMarketContractInstance = getMarketContractInstance,
} = {}) => async dispatch => {
  doGetMarketContractInstance().LogMake(filter, { fromBlock, toBlock: 'latest' })
  .then((err, LogMakeEvent) => {
    const newOfferId = parseInt(LogMakeEvent.args.id, 16);
    dispatch(
      newOfferFilledIn(newOfferId),
    );
    // console.log({ LogMakeEvent })
  });
};