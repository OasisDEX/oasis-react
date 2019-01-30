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
      <div>Read more <a href="">here. [add link!]</a></div>
      <OasisButton
        // className={tableStyles.inputBtn}
        type="button"
        color="success"
        size="xs"
        onClick={dismiss}
      >
        Dismiss
      </OasisButton>

    </div>
  );
};

ClickWarp.displayName = "Announcement";

export default CSSModules(ClickWarp, styles, { allowMultiple: true });
