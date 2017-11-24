import React from 'react';
import ReactDOM from 'react-dom';

import { NoConnection } from '../components/NoConnection';

export const onMissingConnection = () => {
  ReactDOM.render(
    <NoConnection/>
    , document.getElementById('root'));
};