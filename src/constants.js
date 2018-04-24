/**
 *   NETWORKS
 */
export const MAIN_NET_ID = '1';
export const KOVAN_NET_ID = '42';
export const KOVAN = 'kovan';
export const MAIN = 'main';

/**
 * NETWORK STATUS
 */
export const ONLINE = 'NETWORK/ONLINE';
export const CONNECTING = 'NETWORK/CONNECTING';
export const OUT_OF_SYNC = 'NETWORK/OUT_OF_SYNC';
export const CLOSED = 'NETWORK/CLOSED';

/**
 * BIG NUMBER
 */
export const BN_DECIMAL_PRECISION = 18;

/**
 * PRECISION
 */

export const ETH_UNIT_WEI = 'wei';               // wei 	1 wei 	1
export const ETH_UNIT_KWEI = 'kwei';             // Kwei (babbage) 	1e3 wei 	1,000
export const ETH_UNIT_MWEI = 'mwei';             // Mwei (lovelace) 	1e6 wei 	1,000,000
export const ETH_UNIT_GWEI = 'gwei';             // Gwei (shannon) 	1e9 wei 	1,000,000,000
export const ETH_UNIT_MICROETHER = 'microether'; // microether (szabo) 	1e12 wei 	1,000,000,000,000
export const ETH_UNIT_MILIETHER = 'milliether';  // milliether (finney) 	1e15 wei 	1,000,000,000,000,000
export const ETH_UNIT_ETHER = 'ether';  // ether 	1e18 wei 	1,000,000,000,000,000,000


export const HAS_ACCOUNTS = true;
export const NO_ACCOUNTS = false;

export const TOKEN_ETHER = 'ETH';
export const TOKEN_WRAPPED_ETH = 'W-ETH';
export const TOKEN_WRAPPED_GNT = 'W-GNT';
export const TOKEN_1ST = '1ST';
export const TOKEN_DAI = 'DAI';
export const TOKEN_SAI = 'SAI';
export const TOKEN_MAKER = 'MKR';
export const TOKEN_DIGIX = 'DGD';
export const TOKEN_GOLEM = 'GNT';
export const TOKEN_RHOC = 'RHOC';
export const TOKEN_AUGUR = 'REP';
export const TOKEN_ICONOMI = 'ICN';
export const TOKEN_PLUTON = 'PLU';
export const TOKEN_SINGULARDTV = 'SNGLS';
export const TOKEN_VSL = 'VSL';
export const TOKEN_MLN = 'MLN';
export const TOKEN_TIME = 'TIME';
export const TOKEN_GUP = 'GUP';
export const TOKEN_BAT = 'BAT';
export const TOKEN_NMR = 'NMR';


export const QUOTE_TOKENS = [
  'W-ETH',
];

export const BASE_TOKENS = [
  'W-GNT', 'DAI', 'DGD', 'REP', 'ICN', '1ST', 'SNGLS',
  'VSL', 'PLU', 'MLN', 'RHOC', 'TIME', 'GUP', 'BAT', 'NMR',
];

export const MAKE_BUY_OFFER = 'OFFER_MAKES/MAKE_BUY_OFFER';
export const MAKE_SELL_OFFER = 'OFFER_MAKES/MAKE_SELL_OFFER';
export const MAKE_SELL_OFFER_FORM_NAME = 'makeSellOffer';
export const MAKE_BUY_OFFER_FORM_NAME = 'makeBuyOffer';
