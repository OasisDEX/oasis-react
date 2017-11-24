/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisBuyOrders from './OasisBuyOrders';

describe('(Component) OasisBuyOrders', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <OasisBuyOrders {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
