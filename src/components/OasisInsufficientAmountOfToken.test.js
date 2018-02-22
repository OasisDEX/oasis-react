/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisInsufficientAmountOfToken from './OasisInsufficientAmountOfToken';


describe('(Component) OasisInsufficientAmountOfToken', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisInsufficientAmountOfToken {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
