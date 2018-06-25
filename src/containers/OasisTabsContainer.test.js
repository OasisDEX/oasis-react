/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisTabsContainerWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisTabsContainer';
import { shallow } from 'enzyme';

describe('(Container) OasisTabsContainer', () => {
  const state = fromJS(global.storeMock);
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
      <OasisTabsContainerWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
