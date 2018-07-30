import OasisSignificantDigitsWrapper from "../containers/OasisSignificantDigits";
import { ETH_UNIT_ETHER } from "../constants";
import OasisLoadingIndicator from "./OasisLoadingIndicator";
import React from "react";

export const OasisMarketWidgetVolumeTemplate = row => {
  if (row && row.initialMarketHistoryLoaded) {
    return row.volume ? (
      <OasisSignificantDigitsWrapper
        fullPrecisionUnit={ETH_UNIT_ETHER}
        fullPrecisionAmount={row.volumeFullPrecision}
        amount={row.volume}
        fractionalZerosGrey={false}
      />
    ) : (
      "N/A"
    );
  } else {
    return (
      <span style={{ position: "relative", right: "20px" }}>
        <OasisLoadingIndicator size="sm" />
      </span>
    );
  }
};
