/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  OasisHeaderWrapper,
  mapStateToProps,
  mapDispatchToProps,
} from './OasisHeader';
import { shallow } from 'enzyme';

describe('(Container) OasisHeader', () => {
  const state = Immutable.fromJS({});
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });

  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisHeaderWrapper {...props}/>,
    );
    expect(wrapper).toMatchSnapshot();
  });

});
