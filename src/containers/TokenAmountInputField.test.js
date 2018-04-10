/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  TokenAmountInputFieldWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './TokenAmountInputField';
import { shallow } from 'enzyme';

describe('(Container) TokenAmountInputField', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    fieldName: 'exampleName'
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <TokenAmountInputFieldWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
