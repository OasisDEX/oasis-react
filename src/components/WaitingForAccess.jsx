import React from 'react';
import CSSModules from "react-css-modules";

import styles from "./WaitingForAccess.scss";
import EthereumLogo from "./../assets/ethereum-logo.svg";

const WaitingForAccess = () => {
  return (
    <div className={styles.NoEthereumSection}>
      <img
        className={styles.ImgEthereumLogo}
        alt="Ethereum"
        src={EthereumLogo}
      />
      <h2>WAITING FOR ACCESS...</h2>
    </div>
  );
};

WaitingForAccess.displayName = "WaitingForAccess";

export default CSSModules(WaitingForAccess, styles, { allowMultiple: true });
