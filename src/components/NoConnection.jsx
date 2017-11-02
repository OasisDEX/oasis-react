import React from 'react';
import styles from './NoConnection.scss';
import MakerLogo from './../assets/logo.svg';
import EthereumLogo from './../assets/ethereum-logo.svg';
import MetamaskLogo from './../assets/metamask-logo.svg';
import MistLogo from './../assets/mist-logo.svg';

export const NoConnection = () => {
  return (
      <div className={styles.NoEthereumSection}>
        <img className={styles.ImgHeaderLogo} alt="Maker" src={MakerLogo}/>
        <hr className={styles.HorizontalLine}/>
        <img className={styles.ImgEthereumLogo} alt="Ethereum"
             src={EthereumLogo}/>
        <h2>NOT CONNECTED TO ETHEREUM</h2>
        <p className={`${styles.PNotFound}`}>
          OasisDEX requires an Ethereum client to
          be running and current. OasisDEX could not
          detect a client running which probably means it&quot;s not installed,
          running or is misconfigured.</p>
        <p className={`${styles.PUseClients}`}>
          Please use one of the following clients to connect to Ethereum:
        </p>
        <div className={styles.DivClients}>
          <div className={styles.DivMetamask}>
            <img className={styles.ImgLogo} alt="Metamask" src={MetamaskLogo}/>
            <h2>METAMASK</h2>
            <p>
              <span className={styles.AlignNumber}><span
                  className={styles.NumberCircle}>1</span></span>Install <a
                className={`${styles.SpanMontserratSemiBold} ${styles.ALink}`}
                href="https://metamask.io/" rel="noopener noreferrer"
                target="_blank">Metamask</a></p>
            <p>
              <span className={styles.AlignNumber}>
                <span
                  className={styles.NumberCircle}>2</span>
              </span>Use Chrome to browse <a
                className={`${styles.SpanMontserratSemiBold} ${styles.ALink}`}
                href="https://oasisdex.com" rel="noopener noreferrer"
                target="_blank">https://oasisdex.com</a>
            </p>
          </div>
          <div className={styles.DivMist}>
            <img className={styles.ImgLogo} alt="Mist" src={MistLogo}/>
            <h2>MIST</h2>
            <p>
              <span className={styles.AlignNumber}><span
                  className={styles.NumberCircle}>1</span></span>Install and run <a
                className={`${styles.SpanMontserratSemiBold} ${styles.ALink}`}
                href="https://github.com/ethereum/mist/releases"
                rel="noopener noreferrer" target="_blank">Mist</a></p>
            <p>
            <span className={styles.AlignNumber}>
              <span className={styles.NumberCircle}>2</span>
            </span>
              Use Mist to browse
              <a className={`${styles.SpanMontserratSemiBold} ${styles.ALink}`}
                 href="https://oasisdex.com" rel="noopener noreferrer"
                 target="_blank">https://oasisdex.com
              </a>
            </p>
          </div>
        </div>
        <p className={`${styles.PConnectGeth}`}>
          While you can also connect with
          <b>geth</b> or <b>parity</b>, a more advanced
          configuration is needed. See the
          <a href="https://github.com/OasisDEX/oasis/wiki#network"
             rel="noopener noreferrer" target="_blank">OasisDEX
            documentation</a> for instructions.
        </p>
      </div>
  );
};

NoConnection.displayName = 'NoConnection';