/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  OasisWrapUnwrapHistoryWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisWrapUnwrapHistory';
import { shallow } from 'enzyme';

describe('(Container) OasisWrapUnwrapHistory', () => {
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
      <OasisWrapUnwrapHistoryWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
