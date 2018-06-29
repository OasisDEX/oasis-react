import _ from 'lodash';
import { createStructuredSelector } from "reselect";
import { formValueSelector } from "redux-form/immutable";

const getProps = (...args) => args[1];

function formFieldsSelector(formName, ...fields) {
  const form = formValueSelector(formName);
  return createStructuredSelector(_.fromPairs(fields.map(f => [[f], s => form(s, f)])));
}

export default {
  getProps,
  formFieldsSelector,
}
