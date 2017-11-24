/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import Locked from './Locked';


describe('(Component) Locked', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <Locked {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
