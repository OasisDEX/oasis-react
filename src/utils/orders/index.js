import { formatAmount, formatPrice } from '../tokens/pair';
import { ETH_UNIT_ETHER } from '../../constants';

const toDisplayFormat = offer => ({
  ask_price: formatPrice(offer.ask_price),
  bid_price: formatPrice(offer.bid_price),
  sell_how_much: formatAmount(offer.sellHowMuch, true,  ETH_UNIT_ETHER),
  buy_how_much: formatAmount(offer.buyHowMuch, true, ETH_UNIT_ETHER),
});

export {
  toDisplayFormat
}