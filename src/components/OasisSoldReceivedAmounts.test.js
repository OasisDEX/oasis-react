/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisSoldReceivedAmounts from './OasisSoldReceivedAmounts';


describe('(Component) OasisSoldReceivedAmounts', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisSoldReceivedAmounts {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
