/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisBuyMaker from './OasisBuyMaker';

describe('(Component) OasisBuyMaker', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <OasisBuyMaker {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
