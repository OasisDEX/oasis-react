import React from 'react';
import CSSModules from "react-css-modules";

import styles from "./WaitingForAccess.scss";
import OasisButton from "./OasisButton";

function dismiss() {
  localStorage.setItem('shutdownAnnouncement', 'true');
  location.reload();
}

const ClickWarp = () => {
  return (
    <div className={styles.NoEthereumSection}>
      <h2>IMPORTANT</h2>
      <div>OasisDex UI has been shut down.</div>
      <div>Only order cancellation is enabled.</div>
      <div style={{ marginTop: '1em', fontSize: '80%' }}>
        If you trade on ETHDAI market, you don&apos;t need
        to do anything - just use <a href="https://eth2dai.com/">eth2dai.com</a>.
      </div>
      <div style={{ fontSize: '80%' }}>
        If you trade on MKRDAI or MKRETH, you can cancel your orders,
        but you will not be able to place new ones.
        Use one of the many other exchanges to buy/sell MKR.
      </div>
      <div style={{ marginTop: '1em' }}>
        Read more <a href="https://medium.com/makerdao/a-new-oasis-5b9539a64adf">here</a>.
      </div>
      <OasisButton
        style={{ marginTop: '1em' }}
        // className={tableStyles.inputBtn}
        type="button"
        color="success"
        size="md"
        onClick={dismiss}
      >
        Dismiss
      </OasisButton>

    </div>
  );
};

ClickWarp.displayName = "Announcement";

export default CSSModules(ClickWarp, styles, { allowMultiple: true });
