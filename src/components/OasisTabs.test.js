/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';

import OasisTabs from './OasisTabs';
import { shallow } from 'enzyme';

describe('(Component) OasisTabs', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <OasisTabs {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
