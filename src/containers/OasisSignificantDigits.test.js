/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisSignificantDigitsWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisSignificantDigits';
import { shallow } from 'enzyme';

describe('(Container) OasisSignificantDigits', () => {
  const state = fromJS({});
  const initialProps = mapStateToProps(state, { amount : '42.00112' });
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    amount: '42.00112'
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisSignificantDigitsWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
