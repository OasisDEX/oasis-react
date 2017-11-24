/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';

import OasisCard from './OasisCard';
import { shallow } from 'enzyme';

describe('(Component) OasisCard', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      ),
    };
    const wrapper = shallow(
      <OasisCard {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
