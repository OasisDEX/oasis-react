/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisSellOrders from './OasisSellOrders';

describe('(Component) OasisSellOrders', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <OasisSellOrders {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
