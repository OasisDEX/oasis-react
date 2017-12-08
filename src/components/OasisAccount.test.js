/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import {OasisAccount} from './OasisAccount';

describe('(Component) OasisAccount', () => {
  it('should render', () => {
    const props = {
      accounts: []
    };
    const wrapper = shallow(
      <OasisAccount {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
