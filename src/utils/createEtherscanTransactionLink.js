const createEtherscanTransactionLink = ({ activeNetworkName, transactionHash }) =>
  `https://${activeNetworkName}.etherscan.io/tx/${transactionHash}`;

export default createEtherscanTransactionLink;