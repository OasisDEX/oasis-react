import loadContact from '../utils/contracts/loadContract';

const config = require('./../configs');

const init = (networkName) => {

  const tokencontractsDeploymentAdressessList = config['tokens'][networkName];
  const marketDeploymentAddress = config['market'][networkName]['address'];

  const erc20Abi = require('./../contracts/abi/standard-token/erc20.json');
  const WEthAbi = require('./../contracts/abi/standard-token/ds-eth-token.json');
  const TokenWrapperAbi = require('./../contracts/abi/token-wrapper/token-wrapper.json');
  const MatchingMarketAbi = require('./../contracts/abi/maker-otc/matching-market');

  const WETH = loadContact(WEthAbi.interface, tokencontractsDeploymentAdressessList['W-ETH']);
  const DAI =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['DAI']);
  const SAI =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['SAI']);
  const MKR =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['MKR']);
  const DGD =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['DGD']);
  const GNT =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['GNT']);
  const WGNT = loadContact(TokenWrapperAbi.interface, tokencontractsDeploymentAdressessList['W-GNT']);
  const REP =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['REP']);
  const ICN =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['ICN']);
  const _1ST = loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['1ST']);
  const SNGLS =loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['SNGLS']);
  const VSL =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['VSL']);
  const PLU =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['PLU']);
  const MLN =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['MLN']);
  const RHOC = loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['RHOC']);
  const TIME = loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['TIME']);
  const GUP =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['GUP']);
  const BAT =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['BAT']);
  const NMR =  loadContact(erc20Abi.interface, tokencontractsDeploymentAdressessList['NMR']);

  const market = loadContact(MatchingMarketAbi.interface, marketDeploymentAddress);

  window.contracts = {
    tokens: {
      WETH, DAI, SAI, MKR,
      DGD, GNT, WGNT, REP,
      ICN, _1ST, SNGLS, VSL,
      PLU, MLN, RHOC, TIME, GUP,
      BAT, NMR,
    },
    market,
  };
};

export default {
  init,
};