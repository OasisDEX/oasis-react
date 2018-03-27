
import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';
import { fromJS } from 'immutable';
import moment from 'moment';

import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisTable from '../components/OasisTable';

import { formatAmount } from '../utils/tokens/pair';


const propTypes = PropTypes && {
};



/* eslint-disable react/prop-types */
const wrapUnwrapHistoryColsDefinition = () => [
  { heading: 'date', template: ({ timestamp }) => moment.unix(timestamp).format('DD-MM-HH:mm') },
  { heading: 'action', key: 'action' },
// eslint-disable-next-line react/display-name
  { heading: 'coin', key: 'tokenName' },
  { heading: `amount`, template: ({tokenAmount}) => formatAmount(tokenAmount, true) },
];


export class OasisWrapUnwrapHistory extends PureComponent {
  constructor(props) {
    super(props);
  }

  onRowClick({ transactionHash }, { activeNetworkName }) {
    const url = `https://${activeNetworkName}.etherscan.io/tx/${transactionHash}`;
    window.open(url, '_blank');
    window.focus();
  }

  render() {
    const { wrapUnwrapHistoryList = fromJS([]), activeNetworkName } = this.props;
    return (
      <OasisWidgetFrame heading="History">
        <div>
          {<OasisTable metadata={{activeNetworkName}}
                       onRowClick={this.onRowClick}
                       rows={wrapUnwrapHistoryList.toJSON()}
                       col={wrapUnwrapHistoryColsDefinition()}
          />}
        </div>
      </OasisWidgetFrame>
    );
  }

}


OasisWrapUnwrapHistory.propTypes = propTypes;
OasisWrapUnwrapHistory.displayName = 'OasisTokenWrapUnwrapHistory';
export default OasisWrapUnwrapHistory;
