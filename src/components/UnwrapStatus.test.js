/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import UnwrapStatus from './UnwrapStatus';


describe('(Component) UnwrapStatus', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <UnwrapStatus {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
