/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisTransferHistory from './OasisTransferHistory';


describe('(Component) OasisTransferHistory', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisTransferHistory {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
