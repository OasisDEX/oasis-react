/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisWrapUnwrapUnwrap from './OasisWrapUnwrapUnwrap';

describe('(Component) OasisWrapUnwrapUnwrap', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      ),
    };
    const wrapper = shallow(
      <OasisWrapUnwrapUnwrap {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
