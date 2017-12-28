function loadContact(abi, contractAddress, nopromises) {
  try {
    if (!window.web3.isAddress(contractAddress)) {
      throw new Error({
        msg: 'contract address argument is not an valid ethereum address',
      });
    }
    const contractFactory = window.web3.eth.contract(abi);

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
        if (inner instanceof Function){
          if(/^[a-z]/.test(name)) {
            return (...args) => {
              return promisify(cb => inner(...args, cb));
            }
          } else {
            return (...args) => {
              const filterInstance = inner(...args);
              target['then'] = filterInstance.watch.bind(filterInstance);
              target['get'] = filterInstance.get.bind(filterInstance);
              return target;
            }
          }
        } else if (typeof inner === 'object') {
          return new window.Proxy(inner, proxiedWeb3Handler);
        } else {
          return inner;
        }
      },
    };
    return new window.Proxy(contractFactory.at(contractAddress), proxiedWeb3Handler);
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    return null;
  }
}

export default loadContact;
