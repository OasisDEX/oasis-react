import Web3 from 'web3';

const web3 = new Web3();

export default web3;

const settings = require('./settings');
const initWeb3 = (web3) => {
  if (window.web3) {
    web3.setProvider(window.web3.currentProvider);
  } else {
    web3.setProvider(new Web3.providers.HttpProvider(settings.nodeURL));
  }
  window.web3 = web3;
}

export { initWeb3 };
