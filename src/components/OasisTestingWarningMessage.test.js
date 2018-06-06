/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisTestingWarningMessage from './OasisTestingWarningMessage';


describe('(Component) OasisTestingWarningMessage', () => {
  it('should render', () => {
    const props = {};
    const wrapper = shallow(
      <OasisTestingWarningMessage {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
