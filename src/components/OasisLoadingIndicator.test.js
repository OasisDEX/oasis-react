/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisLoadingIndicator from './OasisLoadingIndicator';


describe('(Component) OasisLoadingIndicator', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisLoadingIndicator {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
