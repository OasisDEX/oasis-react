import createEtherscanTransactionLink from './createEtherscanTransactionLink'

function openEtherscanTransactionLink({...kwargs}) {
  window.open(
    createEtherscanTransactionLink(kwargs),
    "_blank",
  );
  window.focus();
}

export default openEtherscanTransactionLink;
