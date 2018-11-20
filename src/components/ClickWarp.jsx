import React from 'react';
import CSSModules from "react-css-modules";

import styles from "./WaitingForAccess.scss";
import OasisButton from "./OasisButton";

function dismiss() {
  localStorage.setItem('clickWarp', 'true');
  location.reload();
}

const ClickWarp = () => {
  return (
    <div className={styles.NoEthereumSection}>
      <h2>ClickWarp...</h2>
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

ClickWarp.displayName = "Terms of service";

export default CSSModules(ClickWarp, styles, { allowMultiple: true });
