/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisTransactionIsAwaitingSign from './OasisTransactionIsAwaitingSign';


describe('(Component) OasisTransactionIsAwaitingSign', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisTransactionIsAwaitingSign {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
