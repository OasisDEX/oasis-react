/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import { OasisExpirationDate } from './OasisExpirationDate';

describe('(Component) OasisExpirationDate', () => {
  it('should render', () => {
    const props = {
      timestamp: 1536674743
    };
    const wrapper = shallow(
      <OasisExpirationDate {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
