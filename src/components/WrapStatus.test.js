/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import WrapStatus from './WrapStatus';


describe('(Component) WrapStatus', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <WrapStatus {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
