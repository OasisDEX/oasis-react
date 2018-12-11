import React from 'react';
import CSSModules from "react-css-modules";

import styles from "./WaitingForAccess.scss";
import OasisButton from "./OasisButton";

function dismiss() {
  localStorage.setItem('announcement', 'true');
  location.reload();
}

const ClickWarp = () => {
  return (
    <div className={styles.NoEthereumSection}>
      <h2>IMPORTANT</h2>
      <div>This is a new contract deployment.</div>
      <div>Old contract is still <a href="https://old.oasisdex.com">available</a>.</div>
      <div>Read more <a href="https://en.reddit.com/r/MakerDAO/comments/9z7h2x/an_announcement_from_the_oasis_team/">here.</a></div>
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
