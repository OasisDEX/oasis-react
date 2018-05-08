/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import {
  OasisChart,
  mapStateToProps,
  mapDispatchToProps,
} from './OasisChart';

describe('(Component) OasisChart', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps
  };

  it('should render', () => {
    const wrapper = shallow(
      <OasisChart {...props}/>,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
