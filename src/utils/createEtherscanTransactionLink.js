import { KOVAN } from "../constants";

const createEtherscanTransactionLink = ({
  activeNetworkName,
  transactionHash
}) => {
  console.log({ transactionHash, activeNetworkName });
  switch (activeNetworkName) {
    case KOVAN:
      return `https://${activeNetworkName}.etherscan.io/tx/${transactionHash}`;
    default:
      return `https://etherscan.io/tx/${transactionHash}`;
  }
};

export default createEtherscanTransactionLink;
