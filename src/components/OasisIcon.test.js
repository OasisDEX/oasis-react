/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisIcon from './OasisIcon';


describe('(Component) OasisIcon', () => {
  it('should render', () => {
    const props = {
      icon: 'loading'
    };
    const wrapper = shallow(
      <OasisIcon {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
