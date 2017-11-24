/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';

import OasisLogo from './OasisLogo';
import { shallow } from 'enzyme';

describe('(Component) OasisLogo', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <OasisLogo {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
