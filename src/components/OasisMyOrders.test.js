/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisMyOrders from './OasisMyOrders';
import { fromJS } from 'immutable';

describe('(Component) OasisMyOrders', () => {
  it('should render', () => {
    const props = {
      activeTradingPair: { baseToken: "MKR", quoteToken: "W-ETH" },
      sellOffers: fromJS([]),
      buyOffers: fromJS([]),
      onFetchAndSubscribeUserTradesHistory: jest.fn()
    };
    const wrapper = shallow(
      <OasisMyOrders {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
