import { createNumberMask } from "redux-form-input-masks";

export const amountMask = (options = {}) =>  createNumberMask({ ...options, decimalPlaces: 5, locale: 'en' });