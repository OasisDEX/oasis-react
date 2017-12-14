/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';

import { OasisMessage } from './OasisMessage';
import { shallow } from 'enzyme';

describe('(Component) OasisMessage', () => {
  it('should render', () => {
    const props = {
      heading: 'Hello world'
    };
    const wrapper = shallow(
      <OasisMessage {...props}>
        <div>Message content</div>
      </OasisMessage>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
