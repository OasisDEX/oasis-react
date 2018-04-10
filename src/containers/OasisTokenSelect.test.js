/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisTokenSelectWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisTokenSelect';
import { shallow } from 'enzyme';

describe('(Container) OasisTokenSelect', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, { name: 'exampleSelectName'});
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
      <OasisTokenSelectWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
