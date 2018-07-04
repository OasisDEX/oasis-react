import { KOVAN } from "../constants";

const createEtherscanTransactionLink = ({
  activeNetworkName,
  transactionHash
}) => {
  switch (activeNetworkName) {
    case KOVAN:
      return `https://${activeNetworkName}.etherscan.io/tx/${transactionHash}`;
    default:
      return `https://etherscan.io/tx/${transactionHash}`;
  }
};

export const createEtherscanAddressLink = ({
  networkName,
  address,
}) => {
  switch (networkName) {
    case KOVAN:
      return `https://${networkName}.etherscan.io/address/${address}`;
    default:
      return `https://etherscan.io/address/${address}`;
  }
};

export default createEtherscanTransactionLink;
