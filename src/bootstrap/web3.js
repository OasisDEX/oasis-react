import Web3 from 'web3';
const web3 = new Web3();

export default web3;

let web3p = null;

const settings = require('../settings');

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      else { resolve(res); }
    })
  );

const proxiedWeb3Handler = {
  get: (target, name) => {
    const inner = target[name];
    if (inner instanceof Function) {
      return (...args) => promisify(cb => inner(...args, cb));
    } else if (typeof inner === 'object') {
      return new window.Proxy(inner, proxiedWeb3Handler);
    } else {
      return inner;
    }
  },
};

const init = () => {
  if (web3 && window.web3) {
    web3.setProvider(window.web3.currentProvider);
  } else {
    web3.setProvider(new Web3.providers.HttpProvider(settings.nodeURL));
  }
  web3p = new window.Proxy(web3, proxiedWeb3Handler);
};

export { init, web3p };
