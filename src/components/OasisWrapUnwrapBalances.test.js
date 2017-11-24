/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisWrapUnwrapBalances from './OasisWrapUnwrapBalances';

describe('(Component) OasisWrapUnwrapBalances', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      ),
    };
    const wrapper = shallow(
      <OasisWrapUnwrapBalances {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
