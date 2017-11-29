import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './NoConnection.scss';
import MakerLogo from './../assets/logo.svg';
import EthereumLogo from './../assets/ethereum-logo.svg';
import MetamaskLogo from './../assets/metamask-logo.svg';
import MistLogo from './../assets/mist-logo.svg';


const NoConnection = () => {
  return (
    <div styleName='NoEthereumSection'>
      <img styleName='ImgHeaderLogo' alt="Maker" src={MakerLogo}/>
      <hr styleName='HorizontalLine'/>
      <img styleName='ImgEthereumLogo' alt="Ethereum" src={EthereumLogo}/>
      <h2>NOT CONNECTED TO ETHEREUM</h2>
      <p styleName='PNotFound'>
        OasisDEX requires an Ethereum client to
        be running and current. OasisDEX could not
        detect a client running which probably means it&#39;s not installed,
        running or is misconfigured.
      </p>
      <p styleName='PUseClients'>
        Please use one of the following clients to connect to Ethereum:
      </p>
      <div styleName='DivClients'>
        <div styleName='DivMetamask'>
          <img styleName='ImgLogo' alt="Metamask" src={MetamaskLogo}/>
          <h2>METAMASK</h2>
          <p>
            <span styleName='AlignNumber'>
              <span styleName='NumberCircle'>1</span>
            </span>Install
            <a styleName='SpanMontserratSemiBold ALink'
               href="https://metamask.io/" rel="noopener noreferrer"
               target="_blank"> Metamask
            </a>
          </p>
          <p>
            <span styleName='AlignNumber'>
              <span styleName='NumberCircle'>2</span>
            </span>Use Chrome to browse
            <a styleName='SpanMontserratSemiBold ALink'
               href="https://oasisdex.com" rel="noopener noreferrer"
               target="_blank"> https://oasisdex.com
            </a>
          </p>
        </div>
        <div styleName='DivMist'>
          <img styleName='ImgLogo' alt="Mist" src={MistLogo}/>
          <h2>MIST</h2>
          <p>
            <span styleName='AlignNumber'>
              <span styleName='NumberCircle'>1</span>
            </span>Install and run
            <a styleName='SpanMontserratSemiBold ALink'
               href="https://github.com/ethereum/mist/releases"
               rel="noopener noreferrer" target="_blank"> Mist
            </a>
          </p>
          <p>
            <span styleName='AlignNumber'>
              <span styleName='NumberCircle'>2</span>
            </span>
            Use Mist to browse
            <a styleName='SpanMontserratSemiBold ALink'
               href="https://oasisdex.com" rel="noopener noreferrer"
               target="_blank"> https://oasisdex.com
            </a>
          </p>
        </div>
      </div>
      <div>
        <p styleName='PConnectGeth'>
          While you can also connect with
          <b> geth</b> or <b>parity</b>, a more advanced
          configuration is needed. See the
          <a href="https://github.com/OasisDEX/oasis/wiki#network"
             rel="noopener noreferrer" target="_blank">
            OasisDEX documentation</a> for instructions.
        </p>
      </div>
    </div>
    // placeholder for the footer with links
  );
};

NoConnection.displayName = 'NoConnection';

export default CSSModules(NoConnection, styles, {allowMultiple: true});