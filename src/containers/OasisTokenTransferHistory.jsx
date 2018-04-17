
import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
// import ImmutablePropTypes from 'react-immutable-proptypes';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisTable from '../components/OasisTable';
import transfers from '../store/selectors/transfers';
import transferHistoryReducer from '../store/reducers/transferHistory';
import platform from '../store/selectors/platform';
import network from '../store/selectors/network';
import transferHistory from '../store/selectors/transferHistory';
import { formatAmount } from '../utils/tokens/pair';
import { Map } from 'immutable';
import styles from './OasisTokenTransferHistory.scss';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};


/* eslint-disable react/prop-types */
// eslint-disable-next-line react/display-name
const RecipientAddress = ({ address }) => (
    <span className={styles.recipientAddress}>
      {address}
    </span>
  );


/* eslint-disable react/prop-types */
const transferHistoryColsDefinition = () => [
  { heading: 'date', template: ({ timestamp }) => moment.unix(timestamp).format('DD-MM-HH:mm') },
  { heading: 'action', key: 'action' },
// eslint-disable-next-line react/display-name
  { heading: 'recipient', template: ({ toAddress }) => <RecipientAddress address={toAddress}/> },
  { heading: 'coin', key: 'tokenName' },
  { heading: `amount`, template: ({tokenAmount}) => formatAmount(tokenAmount, true) },
];


export class OasisTokenTransferHistoryWrapper extends PureComponent {
  constructor(props) {
    super(props);
  }

  onRowClick({ transactionHash }, { activeNetworkName }) {
    const url = `https://${activeNetworkName}.etherscan.io/tx/${transactionHash}`;
    window.open(url, '_blank');
    window.focus();
  }

  render() {
    const { transferHistoryList = Map(), activeNetworkName } = this.props;
    return (
      <OasisWidgetFrame heading="History">
        <div>
          {<OasisTable metadata={{activeNetworkName}}
            className={styles.table}
            onRowClick={this.onRowClick}
            rows={transferHistoryList.toJSON()}
            col={transferHistoryColsDefinition()}
          />}
        </div>
      </OasisWidgetFrame>
    );
  }

  componentWillUpdate({selectedToken, latestBlockNumber, contractsLoaded, actions, isTokenTransferHistoryLoading }) {

    if(latestBlockNumber && contractsLoaded && !isTokenTransferHistoryLoading) {
      actions.loadTokenTransfersHistory(
        selectedToken
      )
    }
  }
}

export function mapStateToProps(state) {
  const selectedToken = transfers.selectedToken(state);
  return {
    selectedToken,
    activeNetworkName: network.getActiveNetworkName(state),
    contractsLoaded: platform.contractsLoaded(state),
    latestBlockNumber: network.latestBlockNumber(state),
    transferHistoryList: transferHistory.tokenTransferHistory(state, selectedToken),
    isTokenTransferHistoryLoading: transferHistory.isTokenTransferHistoryLoading(state, selectedToken)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    loadTokenTransfersHistory: transferHistoryReducer.actions.loadTokenTransfersHistoryEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenTransferHistoryWrapper.propTypes = propTypes;
OasisTokenTransferHistoryWrapper.displayName = 'OasisTokenTransferHistory';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTokenTransferHistoryWrapper);
