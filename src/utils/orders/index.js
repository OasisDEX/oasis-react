import { formatAmount, formatPrice } from '../tokens/pair';
import { ETH_UNIT_ETHER } from '../../constants';
import { TYPE_BUY_OFFER, TYPE_SELL_OFFER } from '../../store/reducers/offers';
import web3 from '../../bootstrap/web3';


const toDisplayFormat = offer => ({
  tradeType: offer.tradeType,
  ask_price: formatPrice(offer.ask_price),
  bid_price: formatPrice(offer.bid_price),
  sell_how_much: formatAmount(offer.sellHowMuch, true,  ETH_UNIT_ETHER),
  buy_how_much: formatAmount(offer.buyHowMuch, true, ETH_UNIT_ETHER),
  owner: offer.owner,
  id: offer.id
});

const getOfferType = (baseToken, { sellWhichTokenAddress, buyWhichTokenAddress }) => {
  const baseTokenAddress = window.contracts.tokens[baseToken].address;
  switch (baseTokenAddress) {
    case sellWhichTokenAddress: return TYPE_SELL_OFFER;
    case buyWhichTokenAddress: return TYPE_BUY_OFFER;
  }
};

const isOfferOwner = ({ owner }, address ) => {
  if(address) {
    return (owner === address);
  } else {
    return owner === web3.eth.defaultAccount;
  }
};

export {
  toDisplayFormat,
  getOfferType,
  isOfferOwner,
}