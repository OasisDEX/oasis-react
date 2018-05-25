import { getTokenContractsList } from '../../bootstrap/contracts';

export default (tokenAddress) => {
  const tokens = Object.entries(getTokenContractsList());
  for (let i = 0; i < tokens.length; ++i) {
    const [tokenName, tokenContract] = tokens[i];
    if (tokenContract.address === tokenAddress) {
      return tokenName;
    }
  }
}