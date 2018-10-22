import React from "react";
import CSSModules from "react-css-modules";
import styles from "./NoConnection.scss";
// import MakerLogo from "./../assets/logo.svg";
import EthereumLogo from "./../assets/ethereum-logo.svg";
import MetamaskLogo from "./../assets/metamask-logo.svg";
import MistLogo from "./../assets/mist-logo.svg";
import CoinbaseWalletLogo from "./../assets/coinbase-icon-512px.png";

const NoConnection = () => {
  return (
    <div className={styles.NoEthereumSection}>
      {/*<img className={styles.ImgHeaderLogo} alt="Maker" src={MakerLogo} />*/}
      {/*<hr className={styles.HorizontalLine} />*/}
      <img
        className={styles.ImgEthereumLogo}
        alt="Ethereum"
        src={EthereumLogo}
      />
      <h2>NOT CONNECTED TO ETHEREUM</h2>
      <p className={styles.PNotFound}>
        OasisDEX requires an Ethereum client to be running and current. OasisDEX
        could not detect a client running which probably means it&#39;s not
        installed, running or is misconfigured.
      </p>
      <p className={styles.PUseClients}>
        Please use one of the following clients to connect to Ethereum:
      </p>
      <div className={styles.DivClients}>
        <div className={styles.DivMetamask}>
          <img className={styles.ImgLogo} alt="Metamask" src={MetamaskLogo} />
          <h2>METAMASK</h2>
          <p>
            <span className={styles.AlignNumber}>
              <span className={styles.NumberCircle}>1</span>
            </span>Install
            <a
              styleName="SpanMontserratSemiBold ALink"
              href="https://metamask.io/"
              rel="noopener noreferrer"
              target="_blank"
            >
              {" "}
              Metamask
            </a>
          </p>
          <p>
            <span className={styles.AlignNumber}>
              <span className={styles.NumberCircle}>2</span>
            </span>Use <b>Chrome</b> to browse
            <a
              rel="noopener noreferrer"
              styleName="SpanMontserratSemiBold ALink"
              href="https://oasisdex.com"
              target="_blank"
            >
              {" "}
              https://oasisdex.com
            </a>
          </p>
        </div>
        <div className={styles.DivMist}>
          <img className={styles.ImgLogo} alt="Mist" src={MistLogo} />
          <h2>MIST</h2>
          <p>
            <span className={styles.AlignNumber}>
              <span className={styles.NumberCircle}>1</span>
            </span>Install and run
            <a
              rel="noopener noreferrer"
              styleName="SpanMontserratSemiBold ALink"
              href="https://github.com/ethereum/mist/releases"
              target="_blank"
            >
              {" "}
              Mist
            </a>
          </p>
          <p>
            <span className={styles.AlignNumber}>
              <span className={styles.NumberCircle}>2</span>
            </span>
            Use <b>Mist</b> to browse
            <a
              rel="noopener noreferrer"
              styleName="SpanMontserratSemiBold ALink"
              href="https://oasisdex.com"
              target="_blank"
            >
              {" "}
              https://oasisdex.com
            </a>
          </p>
        </div>
        <div className={styles.DivMist}>
          <img className={styles.ImgLogo} alt="Mist" src={CoinbaseWalletLogo} />
          <h2>COINBASE WALLET</h2>
          <p>
            <span className={styles.AlignNumber}>
              <span className={styles.NumberCircle}>1</span>
            </span>Install and run
            <a
              rel="noopener noreferrer"
              styleName="SpanMontserratSemiBold ALink"
              href="https://wallet.coinbase.com/"
              target="_blank"
            >
              {" "}
              Coinbase Wallet
            </a>
          </p>
          <p>
            <span className={styles.AlignNumber}>
              <span className={styles.NumberCircle}>2</span>
            </span>
            Use <b>Coinbase Wallet</b> to browse
            <a
              rel="noopener noreferrer"
              styleName="SpanMontserratSemiBold ALink"
              href="https://oasisdex.com"
              target="_blank"
            >
              {" "}
              https://oasisdex.com
            </a>
          </p>
        </div>
      </div>
      <div>
        <p className={styles.PConnectGeth}>
          While you can also connect with
          <b> geth</b> or <b>parity</b>, a more advanced configuration is
          needed. See the
          <a
            href="https://github.com/OasisDEX/oasis/wiki#network"
            rel="noopener noreferrer"
            target="_blank"
          >{" "}OasisDEX documentation
          </a>{" "}
          for instructions.
        </p>
      </div>
    </div>
    // placeholder for the footer with links
  );
};

NoConnection.displayName = "NoConnection";

export default CSSModules(NoConnection, styles, { allowMultiple: true });
