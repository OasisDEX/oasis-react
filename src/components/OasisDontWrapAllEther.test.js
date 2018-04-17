/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisDontWrapAllEther from './OasisDontWrapAllEther';


describe('(Component) OasisDontWrapAllEther', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisDontWrapAllEther {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
