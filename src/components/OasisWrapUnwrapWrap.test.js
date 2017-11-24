/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisWrapUnwrapWrap from './OasisWrapUnwrapWrap';

describe('(Component) OasisWrapUnwrapWrap', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      ),
    };
    const wrapper = shallow(
      <OasisWrapUnwrapWrap {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
