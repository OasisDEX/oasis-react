/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  EthereumAddressInputFieldWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './EthereumAddressInputField';
import { shallow } from 'enzyme';

describe('(Container) EthereumAddressInputField', () => {
  const state = Immutable.fromJS(global.stateMock);
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    fieldName: 'exampleFieldName'
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <EthereumAddressInputFieldWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
