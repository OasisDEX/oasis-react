import web3 from '../../bootstrap/web3';

const createContractInstance = (contractAddress, contractAbi) => {
  return web3.eth.contract(contractAddress).atan(contractAbi);
};

export default createContractInstance;