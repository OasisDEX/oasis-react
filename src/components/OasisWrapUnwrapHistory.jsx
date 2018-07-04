import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';
import { fromJS } from "immutable";
import moment from "moment";

import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import OasisTable from "../components/OasisTable";
import styles from "./OasisWrapUnwrapHistory.scss";

import { formatAmount } from "../utils/tokens/pair";
import OasisSignificantDigitsWrapper from "../containers/OasisSignificantDigits";
import { ETH_UNIT_ETHER } from "../constants";
import OasisLoadingIndicator from "./OasisLoadingIndicator";
import openEtherscanTransactionLink from "../utils/openEtherscanTransactionLink";

const propTypes = PropTypes && {
  isTokenWrapUnwrapHistoryLoaded: PropTypes.bool
};

const amountTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionUnit={ETH_UNIT_ETHER}
    fullPrecisionAmount={row.tokenAmount}
    amount={formatAmount(row.tokenAmount, true)}
  />
);
/* eslint-disable react/prop-types */
const wrapUnwrapHistoryColsDefinition = () => [
  {
    heading: "date",
    template: ({ timestamp }) => moment.unix(timestamp).format("DD-MM HH:mm")
  },
  { heading: "action", key: "action" },
  // eslint-disable-next-line react/display-name
  { heading: "coin", key: "tokenName" },
  { heading: `amount`, template: amountTemplate }
];

export class OasisWrapUnwrapHistory extends PureComponent {
  onRowClick({ transactionHash }, { activeNetworkName }) {
    openEtherscanTransactionLink({ activeNetworkName, transactionHash });
  }

  render() {
    const {
      wrapUnwrapHistoryList = fromJS([]),
      activeNetworkName,
      isTokenWrapUnwrapHistoryLoaded
    } = this.props;
    return (
      <OasisWidgetFrame
        isLoadingData={!isTokenWrapUnwrapHistoryLoaded}
        loadingDataText={"wrap & unwrap history"}
        heading="History"
        loadProgressSection={
          !isTokenWrapUnwrapHistoryLoaded ? (
            <OasisLoadingIndicator size="sm" />
          ) : null
        }
      >
        <div>
          {
            <OasisTable
              metadata={{ activeNetworkName }}
              onRowClick={this.onRowClick}
              className={styles.table}
              rows={wrapUnwrapHistoryList.toJSON()}
              col={wrapUnwrapHistoryColsDefinition()}
            />
          }
        </div>
      </OasisWidgetFrame>
    );
  }
}

OasisWrapUnwrapHistory.propTypes = propTypes;
OasisWrapUnwrapHistory.displayName = "OasisTokenWrapUnwrapHistory";
export default OasisWrapUnwrapHistory;
