/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';

import { OasisStatus } from './OasisStatus';
import { shallow } from 'enzyme';
import { ONLINE } from '../constants';

describe('(Component) OasisStatus', () => {
  it('should render', () => {
    const props = {
      status: ONLINE
    };
    const wrapper = shallow(
      <OasisStatus {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
