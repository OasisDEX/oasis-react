const getTokenContractInstance = (tokenName) => {
  if (window.contracts.tokens[tokenName]){
    return window.contracts.tokens[tokenName];
  } else {
    throw Error(`Contract for '${tokenName}' token not found!`)
  }
};

export default getTokenContractInstance;