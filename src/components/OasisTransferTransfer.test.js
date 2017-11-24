/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisTransferTransfer from './OasisTransferTransfer';

describe('(Component) OasisTransferTransfer', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      ),
    };
    const wrapper = shallow(
      <OasisTransferTransfer {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
