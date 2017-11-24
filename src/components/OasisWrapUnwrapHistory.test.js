/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisWrapUnwrapHistory from './OasisWrapUnwrapHistory';

describe('(Component) OasisWrapUnwrapHistory', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      ),
    };
    const wrapper = shallow(
      <OasisWrapUnwrapHistory {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
