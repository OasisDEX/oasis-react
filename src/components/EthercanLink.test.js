/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import EthercanLink from './EthercanLink';


describe('(Component) EthercanLink', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <EthercanLink {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
