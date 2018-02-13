/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import ExceedsGasLimit from './ExceedsGasLimit';


describe('(Component) ExceedsGasLimit', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <ExceedsGasLimit {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
