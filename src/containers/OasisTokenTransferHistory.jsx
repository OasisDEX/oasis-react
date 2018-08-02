import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
// import ImmutablePropTypes from 'react-immutable-proptypes';
import moment from "moment";
import { bindActionCreators } from "redux";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import OasisTable from "../components/OasisTable";
import transfers from "../store/selectors/transfers";
import transferHistoryReducer, {
  TRANSFER_HISTORY_LOAD_STATUS_COMPLETED,
} from '../store/reducers/transferHistory';
import platform from "../store/selectors/platform";
import network from "../store/selectors/network";
import transferHistory from "../store/selectors/transferHistory";
import { formatAmount } from "../utils/tokens/pair";
import { Map } from "immutable";
import styles from "./OasisTokenTransferHistory.scss";
import openEtherscanTransactionLink from "../utils/openEtherscanTransactionLink";
import OasisSignificantDigitsWrapper from "./OasisSignificantDigits";
import { ETH_UNIT_ETHER } from "../constants";
import OasisLoadingIndicator from "../components/OasisLoadingIndicator";
import accounts from "../store/selectors/accounts";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

/* eslint-disable react/prop-types */
// eslint-disable-next-line react/display-name
const RecipientAddress = ({ address }) => (
  <span className={styles.recipientAddress}>{address}</span>
);

const amountTemplate = ({ tokenAmount }) => (
  <OasisSignificantDigitsWrapper
    fullPrecisionAmount={tokenAmount}
    fullPrecisionUnit={ETH_UNIT_ETHER}
    amount={formatAmount(tokenAmount, true)}
  />
);
/* eslint-disable react/prop-types */
const transferHistoryColsDefinition = () => [
  {
    heading: "date",
    template: ({ timestamp }) => moment.unix(timestamp).format("DD-MM HH:mm")
  },
  { heading: "action", key: "action" },

  {
    heading: "recipient",
    // eslint-disable-next-line react/display-name
    template: ({ toAddress }) => <RecipientAddress address={toAddress} />
  },
  { heading: "coin", key: "tokenName" },
  { heading: `amount`, template: amountTemplate }
];

export class OasisTokenTransferHistoryWrapper extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {
      actions,
      latestBlockNumber,
      contractsLoaded,
      selectedToken,
      hasAccountEntry
    } = this.props;
    if (latestBlockNumber && contractsLoaded && !hasAccountEntry) {
      actions.loadTokenTransfersHistory(selectedToken);
    }
  }

  static onRowClick({ transactionHash }, { activeNetworkName }) {
    openEtherscanTransactionLink({ activeNetworkName, transactionHash });
  }

  render() {
    const {
      tokenTransferHistoryStatus,
      transferHistoryList = Map(),
      activeNetworkName,
      isTokenTransferHistoryLoading
    } = this.props;
    return (
      <OasisWidgetFrame
        isLoadingData={tokenTransferHistoryStatus !== TRANSFER_HISTORY_LOAD_STATUS_COMPLETED}
        loadingDataText={"Your transfer history"}
        loadProgressSection={
          isTokenTransferHistoryLoading ? (
            <OasisLoadingIndicator size={"md"} />
          ) : null
        }
        heading="History"
        className={styles.frame}
      >
        <div>
          {
            <OasisTable
              metadata={{ activeNetworkName }}
              className={styles.table}
              onRowClick={OasisTokenTransferHistoryWrapper.onRowClick}
              rows={transferHistoryList.toJSON()}
              col={transferHistoryColsDefinition()}
            />
          }
        </div>
      </OasisWidgetFrame>
    );
  }

  UNSAFE_componentWillUpdate({
    selectedToken,
    latestBlockNumber,
    contractsLoaded,
    actions,
    hasAccountEntry,
    tokenTransferHistoryStatus,
    isTokenTransferHistoryLoading
  }) {
    if (
      latestBlockNumber &&
      contractsLoaded &&
      !isTokenTransferHistoryLoading &&
      (!hasAccountEntry || !tokenTransferHistoryStatus)
    ) {
      actions.loadTokenTransfersHistory(selectedToken);
    }
  }
}

export function mapStateToProps(state) {
  const selectedToken = transfers.selectedToken(state);
  return {
    hasAccountEntry: transferHistory.hasAccountEntry(
      state,
      accounts.defaultAccount(state)
    ),
    defaultAccount: accounts.defaultAccount(state),
    selectedToken,
    activeNetworkName: network.activeNetworkName(state),
    contractsLoaded: platform.contractsLoaded(state),
    latestBlockNumber: network.latestBlockNumber(state),
    tokenTransferHistoryStatus: transferHistory.getTokenTransferHistoryStatus(
      state,
      selectedToken
    ),
    transferHistoryList: transferHistory.tokenTransferHistory(
      state,
      selectedToken
    ),
    isTokenTransferHistoryLoading: transferHistory.isTokenTransferHistoryLoading(
      state,
      selectedToken
    )
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    loadTokenTransfersHistory:
      transferHistoryReducer.actions.loadTokenTransfersHistoryEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenTransferHistoryWrapper.propTypes = propTypes;
OasisTokenTransferHistoryWrapper.displayName = "OasisTokenTransferHistory";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisTokenTransferHistoryWrapper
);
