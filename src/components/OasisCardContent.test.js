/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisCardContent from './OasisCardContent';


describe('(Component) OasisCardContent', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisCardContent {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
