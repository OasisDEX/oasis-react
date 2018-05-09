import { KOVAN, MAIN } from '../constants';

const createEtherscanTransactionLink = ({ activeNetworkName, transactionHash }) => {
  switch (activeNetworkName) {
    case MAIN: return `https://etherscan.io/tx/${transactionHash}`;
    case KOVAN: return `https://${activeNetworkName}.etherscan.io/tx/${transactionHash}`
  }
};


export default createEtherscanTransactionLink;