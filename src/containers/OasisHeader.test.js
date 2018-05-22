/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  OasisHeaderWrapper,
  mapStateToProps,
  mapDispatchToProps,
} from './OasisHeader';
import { shallow } from 'enzyme';

describe('(Container) OasisHeader', () => {
  const state = Immutable.fromJS({
    accounts: {
      defaultAccount: '0x777f9200d6ccdde25b79e1ba028d6fb12637f765',
      accounts: [
        '0x777f9200d6ccdde25b79e1ba028d6fb12637f765'
      ]
    },
    network: {
      status: 'NETWORK/ONLINE',
      sync: {
        isPending: false,
        ts: null
      },
      activeNetworkName: 'main',
      activeNetworkId: '1',
      latestBlockNumber: null,
      outOfSync: true,
      networks: [
        {
          id: 100,
          name: 'private',
          startingBlock: null,
          avgBlocksPerDay: null
        },
        {
          id: 1,
          name: 'main',
          startingBlock: null,
          avgBlocksPerDay: 5760
        },
        {
          id: 42,
          name: 'kovan',
          startingBlock: null,
          avgBlocksPerDay: 21600
        },
        {
          id: 3,
          name: 'ropsten',
          startingBlock: null,
          avgBlocksPerDay: null
        }
      ],
      isConnecting: false
    },
    markets: {
      closeTime: '1536662916',
      isMarketOpen: true,
      isOrderMatchingEnabled: true,
      activeMarketAddress: '0x3aa927a97594c3ab7d7bf0d47c71c3877d1de4a1',
      marketType: 'MARKET_TYPE_MATCHING_MARKET',
      isBuyEnabled: true
    }

  });
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialProps,
    ...initialActions
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });

  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisHeaderWrapper {...props}/>,
    );
    expect(wrapper).toMatchSnapshot();
  });

});
