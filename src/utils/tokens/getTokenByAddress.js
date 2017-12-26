export default (tokenAddress) => {
  const tokens = Object.entries(window.contracts.tokens);
  for (let i = 0; i < tokens.length; ++i) {
    const [tokenName, tokenContract] = tokens[i];
    if (tokenContract.address === tokenAddress) {
      return tokenName;
    }
  }
}