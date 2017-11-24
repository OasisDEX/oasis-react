/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisSellMaker from './OasisSellMaker';

describe('(Component) OasisSellMaker', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <OasisSellMaker {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
