/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  OasisToQuotePrecisionWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisToQuotePrecision';
import { shallow } from 'enzyme';

describe('(Container) OasisToQuotePrecision', () => {
  const state = Immutable.fromJS({});
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisToQuotePrecisionWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
