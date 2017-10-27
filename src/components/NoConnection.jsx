import React from 'react';

export const NoConnection = () => {
  return (
    <div className="no-ethereum-section">
      <img className="img-header-logo" alt="Maker" src="logo.svg"/>
      <hr className="horizontal-line"/>
      <img className="img-ethereum-logo" alt="Ethereum" src="ethereum-logo.svg"/>
      <h2>NOT CONNECTED TO ETHEREUM</h2>
      <p className="p-not-found">OasisDEX requires an Ethereum client to be running and current. OasisDEX could not
        detect a client running which probably means it&quot;s not installed,
        running or is misconfigured.</p>
      <p className="p-use-clients">Please use one of the following clients to connect to Ethereum:</p>
      <div className="div-clients">
        <div className="div-metamask">
          <img className="img-logo" alt="Metamask" src="metamask-logo.svg"/>
          <h2>METAMASK</h2>
          <p>
            <span className="align-number"><span className="numberCircle">1</span></span>Install <a
            className="span-montserrat-semi-bold a-link" href="https://metamask.io/" rel="noopener noreferrer"
            target="_blank">Metamask</a></p>
          <p><span className="align-number"><span className="numberCircle">2</span></span>Use Chrome to browse <a
            className="span-montserrat-semi-bold a-link" href="https://oasisdex.com" rel="noopener noreferrer"
            target="_blank">https://oasisdex.com</a></p>
        </div>
        <div className="div-mist">
          <img className="img-logo" alt="Mist" src="mist-logo.svg"/>
          <h2>MIST</h2>
          <p><span className="align-number"><span className="numberCircle">1</span></span>Install and run <a
            className="span-montserrat-semi-bold a-link" href="https://github.com/ethereum/mist/releases"
            rel="noopener noreferrer" target="_blank">Mist</a></p>
          <p><span className="align-number"><span className="numberCircle">2</span></span>Use Mist to browse <a
            className="span-montserrat-semi-bold a-link" href="https://oasisdex.com" rel="noopener noreferrer"
            target="_blank">https://oasisdex.com</a></p>
        </div>
      </div>
      <p className="p-connect-geth">While you can also connect with <b>geth</b> or <b>parity</b>, a more advanced
        configuration is needed. See the
        <a href="https://github.com/OasisDEX/oasis/wiki#network" rel="noopener noreferrer" target="_blank">OasisDEX
          documentation</a> for instructions.
      </p>
    </div>
  );
};

NoConnection.displayName = "NoConnection";