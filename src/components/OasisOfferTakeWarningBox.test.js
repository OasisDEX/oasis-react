/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import OasisOfferTakeWarningBox from './OasisOfferTakeWarningBox';


describe('(Component) OasisOfferTakeWarningBox', () => {
  it('should render', () => {
    const props = {
      children: (
        <span>test</span>
      )
    };
    const wrapper = shallow(
      <OasisOfferTakeWarningBox {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
