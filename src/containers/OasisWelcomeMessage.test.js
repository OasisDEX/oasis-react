/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';

import {
  OasisWelcomeMessageWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisWelcomeMessage';
import { shallow } from 'enzyme';

describe('(Container) OasisWelcomeMessage', () => {
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
  };

  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisWelcomeMessageWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
