/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';

import OasisMarketHistory from './OasisMarketHistory';


describe('(Component) OasisMarketHistory', () => {
  it('should render', () => {
    const props = {
      activeTradingPair: {
        baseToken: 'MKR',
        quoteToken: 'W-ETH'
      },
      trades: []
    };
    const wrapper = shallow(
      <OasisMarketHistory {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
