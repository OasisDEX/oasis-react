/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisMyOrders from './OasisMyOrders';

describe('(Component) OasisMyOrders', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <OasisMyOrders {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
